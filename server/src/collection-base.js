
const { CodedError } = require('./utils/coded-error');
const Joi = require('joi');
const { DatabaseEngine } = require('./database-engine'); // only for intellisense.

class Collection {

  constructor(databaseEngine, databaseService) {
    /** @type {DatabaseEngine} */
    this._db = databaseEngine;
    this._collections = databaseService;
  }

  get name() { throw new CodedError("DEVELOPER_ERROR", "Collection does not specify name property."); }

  get joiSchema() { throw new CodedError("DEVELOPER_ERROR", "Collection does not specify name joiSchema."); }

  // Specify keys/properties that needs to be unique for this collection.
  // example: [
  //   {
  //     filters: additional query to isolate a collection (i.e. by organizationId etc...)
  //     keyList: list of keys that need to be unique.
  //   }
  // ]
  get uniqueKeyDefList() { return []; }

  // Specify foreign key relations
  // example: [
  //   {
  //     targetCollection: name of the target collection
  //     foreignKey: plain path to the foreign key
  //     referringKey: local key that refers to the foreign key
  //   }
  // ]
  get foreignKeyDefList() { return []; }

  // Specify which property is used to indicate that a document
  // is deleted. (i.e. isDeleted).
  // Return null if it is not relevant/deleteable.
  // Deleted documents do not count to unique key checks and other (controlled) queries but do count to foreign key checks.
  get deletionIndicatorKey() { return null; }

  // ================== Internals ================== //

  __validateAgainstSchema(doc, isAlreadyInDb) {
    let joiSchema = this.joiSchema;
    if (isAlreadyInDb) {
      joiSchema = joiSchema.concat(Joi.object({
        id: Joi.any(),
        _id: Joi.any()
      }));
    }
    let { error: err, value } = Joi.validate(doc, joiSchema, {
      convert: false
    });
    if (err) {
      err.details.from = "db";
      throw err;
    }
    return value;
  }

  async __ensureKeysAreUnique(doc, isAlreadyInDb, filters, keyList) {
    await Promise.all(keyList.map(async key => {
      if (!(key in doc)) {
        return reject(new Error(`unique key ${key} is missing from document.`));
      }

      let query = {
        [key]: doc[key],
        $or: [
          { isDeleted: { $exists: false } },
          { isDeleted: false }
        ]
      };
      for (let fragment in filters) {
        query[fragment] = filters[fragment];
      }
      let docList = await this._db.find(this.name, query);
      if ((docList.length === 0 && !isAlreadyInDb) || (docList.length < 2 && isAlreadyInDb)) {
        return true;
      }
      throw new CodedError(`DUPLICATE_${key}`, `Duplicate value found for key ${key}`);
    }));
  }

  async __validateAgainstUniqueKeyDefList(doc, isAlreadyInDb) {
    await Promise.all(this.uniqueKeyDefList.map(async uniqueKeyDef => {
      let { filters, keyList } = uniqueKeyDef;
      await this.__ensureKeysAreUnique(doc, isAlreadyInDb, filters, keyList);
    }));
  }

  async __validateAgainstForeignKeyDefList(doc) {
    await Promise.all(this.foreignKeyDefList.map(async foreignKeyDef => {
      let { targetCollection, foreignKey, referringKey } = foreignKeyDef;
      let query = {
        [foreignKey]: doc[referringKey],
        $or: [
          { isDeleted: { $exists: false } },
          { isDeleted: false }
        ]
      };
      let docList = await this._db.find(targetCollection, query);
      if (docList.length < 1) {
        throw new CodedError('FOREIGN_KEY_VIOLATION', `FOREIGN_KEY_VIOLATION. No ${targetCollection}.${foreignKey} equals to ${doc[referringKey]} but is referred by ${this.collectionName}.${referringKey}`);
      }
      if (docList.length > 1) {
        throw new CodedError('FOREIGN_KEY_VIOLATION', `FOREIGN_KEY_VIOLATION. More than 1 ${targetCollection}.${foreignKey} equals to ${doc[referringKey]}. Referred by ${this.collectionName}.${referringKey}`);
      }
      return true;
    }));
  }

  async __validateDocument(doc, isAlreadyInDb) {
    doc = this.__validateAgainstSchema(doc, isAlreadyInDb);
    await this.__validateAgainstUniqueKeyDefList(doc, isAlreadyInDb);
    await this.__validateAgainstForeignKeyDefList(doc);
  }

  async __updateOneSafe(query, modifications) {
    let originalDoc = await this._db.findOne(this.name, query);
    if (!originalDoc) return false;
    let updatedDoc = await this._db.updateAndReturnNew(this.name, query, modifications);
    if (!updatedDoc) return false;
    let wasUpdated = false;
    try {
      wasUpdated = await this.__validateDocument(updatedDoc, true);
    } catch (err) {
      await this._db.replaceOne(this.name, { id: originalDoc.id }, originalDoc);
      throw err;
    }
    return wasUpdated;
  }

  // ================== Higher Level Database abstraction ================== //

  async _find(query, { skip, limit, sort } = {}) {
    if (this.deletionIndicatorKey) {
      if (!(this.deletionIndicatorKey in query)) {
        query[this.deletionIndicatorKey] = false;
      }
    }
    return await this._db.find(this.name, query, { skip, limit, sort });
  }

  async _findOne(query, { skip, sort } = {}) {
    if (this.deletionIndicatorKey) {
      if (!(this.deletionIndicatorKey in query)) {
        query[this.deletionIndicatorKey] = false;
      }
    }
    return await this._db.findOne(this.name, query, { skip, sort });
  }

  async _insert(doc) {
    await this.__validateDocument(doc, false);
    return await this._db.insertOne(this.name, doc);
  }

  async _insertMany(docList) {
    await Promise.all(docList.map(doc => this.__validateDocument(doc, false)));
    return await this._db.insertOne(this.name, doc);
  }

  async _update(query, modifications) {
    return await this.__updateOneSafe(query, modifications);
  }

  async _updateMany(query, modifications) {
    let docList = await this._find(query);
    if (docList.length === 0) return false;
    await Promise.all(docList.map(doc => this._update({ id: doc.id }, modifications)));
    return true;
  }

  async _delete(query) {
    if (!this.deletionIndicatorKey) {
      throw new CodedError("DEVELOPER_ERROR", "This collection does not support controlled deletion. \
        Either introduce it by specifying deletionIndicatorKey property or directly call this._db.delete \
        which will delete the collection directly from database for ever.");
    }
    let modifications = {
      [this.deletionIndicatorKey]: true
    };
    return await this._update(query, modifications);
  }

  // ================== Commonly used by all collections ================== //

  async findById({ id }) {
    return await this._findOne({ id });
  }

  async listByIdList({ idList }) {
    return await this._find({
      id: { $in: idList }
    });
  }

  async deleteById({ id }) {
    return await this._delete({ id });
  }

}

exports.Collection = Collection;