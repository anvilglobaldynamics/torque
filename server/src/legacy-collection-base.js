
let Joi = require('joi');
const { LegacyDatabase } = require('./legacy-database'); // only for syntax highlighting
const { escapeRegExp } = require('./utils/escape-regexp');

class LegacyCollection {

  constructor(legacyDatabase) {
    this.nonDeletableCollectionNameList = [
      'email-verification-request',
      'phone-verification-request',
      'password-reset-request',
      'employment',
      'fixture',
      'product',
      'session',
      'admin-session'
    ];

    /** @type {LegacyDatabase} */
    this.legacyDatabase = legacyDatabase;

    this.collectionName = null; // subclass needs to define this property

    this.joiSchema = null; // subclass needs to define this property

    this.uniqueKeyDefList = []; // subclass needs to define this property
    // example: [
    //   {
    //     filters: additional query to isolate a collection (i.e. by organizationId etc...)
    //     keyList: list of keys that need to be unique.
    //   }
    // ]

    this.foreignKeyDefList = []; // subclass needs to define this property
    // example: [
    //   {
    //     targetCollection: name of the target collection
    //     foreignKey: plain path to the foreign key
    //     referringKey: local key that refers to the foreign key
    //   }
    // ]
  }

  __validateAgainstSchema(doc, isAlreadyInDb, cbfn) {
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
      return cbfn(err);
    }
    cbfn(null, value);
  }

  __ensureKeysAreUnique(doc, isAlreadyInDb, filters, keyList, cbfn) {
    Promise.all(keyList.map((key) => {
      return new Promise((accept, reject) => {
        let query = {
          $or: [
            { isDeleted: { $exists: false } },
            { isDeleted: false }
          ]
        };

        if (key.indexOf('+') > -1) {
          let innerKeyList = key.split('+');
          innerKeyList.forEach(key => {
            if (!(key in doc)) {
              return reject(new Error(`unique key ${key} is missing from document.`));
            }
            query[key] = doc[key];
          });
        } else {
          if (!(key in doc)) {
            return reject(new Error(`unique key ${key} is missing from document.`));
          }
          query[key] = doc[key];
        }

        for (let fragment in filters) {
          query[fragment] = filters[fragment];
        }

        this.legacyDatabase.find(this.collectionName, query, (err, docList) => {
          if (err) return reject(err);
          if ((docList.length === 0 && !isAlreadyInDb) || (docList.length < 2 && isAlreadyInDb)) {
            return accept();
          }
          err = new Error(`Duplicate value found for key ${key}`);
          err.code = `DUPLICATE_${key}`;
          return reject(err);
        });
      });
    })).then(_ => {
      cbfn();
    }).catch(err => {
      cbfn(err);
    });
  }

  __validateAgainstUniqueKeyDefList(doc, isAlreadyInDb, cbfn) {
    Promise.all(this.uniqueKeyDefList.map(uniqueKeyDef => {
      return new Promise((accept, reject) => {
        let { filters, keyList } = uniqueKeyDef;
        this.__ensureKeysAreUnique(doc, isAlreadyInDb, filters, keyList, (err) => {
          if (err) return reject(err);
          accept();
        });
      });
    })).then(_ => {
      cbfn();
    }).catch(err => {
      cbfn(err);
    });
  }

  __validateAgainstForeignKeyDefList(doc, cbfn) {
    Promise.all(this.foreignKeyDefList.map(foreignKeyDef => {
      return new Promise((accept, reject) => {
        let { targetCollection, foreignKey, referringKey } = foreignKeyDef;
        let query = {
          [foreignKey]: doc[referringKey],
          $or: [
            { isDeleted: { $exists: false } },
            { isDeleted: false }
          ]
        };
        this.legacyDatabase.find(targetCollection, query, (err, docList) => {
          if (err) return reject(err);
          if (docList.length === 1) {
            return accept();
          }
          err = new Error(`FOREIGN_KEY_VIOLATION. No ${targetCollection}.${foreignKey} equals to ${doc[referringKey]} but is referred by ${this.collectionName}.${referringKey}`);
          err.code = `FOREIGN_KEY_VIOLATION`;
          return reject(err);
        });
      });
    })).then(_ => {
      cbfn();
    }).catch(err => {
      cbfn(err);
    });
  }

  __validateDocument(doc, isAlreadyInDb, cbfn) {
    this.__validateAgainstSchema(doc, isAlreadyInDb, (err, doc) => {
      if (err) return cbfn(err);
      this.__validateAgainstUniqueKeyDefList(doc, isAlreadyInDb, (err) => {
        if (err) return cbfn(err);
        this.__validateAgainstForeignKeyDefList(doc, cbfn);
      });
    });
  }

  __updateOneSafe(query, modifications, cbfn) {
    this.legacyDatabase.findOne(this.collectionName, query, (err, originalDoc) => {
      if (err) return cbfn(err);
      if (!originalDoc) return cbfn(null, false);
      this.legacyDatabase.updateOne(this.collectionName, query, modifications, (err, wasSuccessful) => {
        if (err) return cbfn(err);
        if (!wasSuccessful) return cbfn(null, false);
        this.legacyDatabase.findByEmbeddedId(this.collectionName, originalDoc._id, (err, updatedDoc) => {
          if (err) return cbfn(err);
          if (!updatedDoc) return cbfn(null, false);
          this.__validateDocument(updatedDoc, true, (err) => {
            if (err) {
              this.legacyDatabase.replaceOne(this.collectionName, { id: originalDoc.id }, originalDoc, (_err, _wasUpdated) => {
                return cbfn(err, false);
              });
            } else {
              return cbfn(null, true);
            }
          });
        });
      });
    });
  }

  _find(query, ...args) {
    if (this.nonDeletableCollectionNameList.indexOf(this.collectionName) === -1) {
      if (!('isDeleted' in query)) {
        query.isDeleted = false;
      }
    }
    return this.legacyDatabase.find(this.collectionName, query, ...args);
  }

  _findOne(query, ...args) {
    if (this.nonDeletableCollectionNameList.indexOf(this.collectionName) === -1) {
      if (!('isDeleted' in query)) {
        query.isDeleted = false;
      }
    }
    return this.legacyDatabase.findOne(this.collectionName, query, ...args);
  }

  _insert(doc, cbfn) {
    if ('createdDatetimeStamp' in doc) return cbfn(new Error("DevError: createdDatetimeStamp must not be set manually."));
    if ('lastModifiedDatetimeStamp' in doc) return cbfn(new Error("DevError: lastModifiedDatetimeStamp must not be set manually."));
    doc.createdDatetimeStamp = Date.now();
    doc.lastModifiedDatetimeStamp = Date.now();
    this.__validateDocument(doc, false, (err) => {
      if (err) return cbfn(err);
      this.legacyDatabase.autoGenerateKey(this.collectionName, (err, id) => {
        if (err) return cbfn(err);
        doc.id = id;
        this.legacyDatabase.insertOne(this.collectionName, doc, (err, wasInserted) => {
          if (err) return cbfn(err);
          if (!wasInserted) return cbfn(new Error(`Could not insert ${this.collectionName} for reasons unknown.`));
          return cbfn(null, id);
        });
      });
    });
  }

  _update(query, modifications, cbfn) {
    if (!('$set' in modifications)) {
      modifications.$set = {};
    }
    if ('createdDatetimeStamp' in modifications.$set) return cbfn(new Error("DevError: createdDatetimeStamp must not be set manually."));
    if ('lastModifiedDatetimeStamp' in modifications.$set) return cbfn(new Error("DevError: lastModifiedDatetimeStamp must not be set manually."));
    modifications.$set.lastModifiedDatetimeStamp = Date.now();
    return this.__updateOneSafe(query, modifications, cbfn);
    // return this.legacyDatabase.updateOne(this.collectionName, query, modifications, cbfn);
  }

  _updateMany(query, modifications, cbfn) {
    this._find(query, (err, docList) => {
      if (err) return cbfn(err);
      Promise.all(docList.map(doc => new Promise((accept, reject) => {
        const clone = (obj) => JSON.parse(JSON.stringify(obj));
        this._update({ id: doc.id }, clone(modifications), (err, wasSuccessful) => {
          if (err) return reject(err);
          return accept();
        });
      }))).then(() => {
        return cbfn(null, (docList.length > 0));
      }).catch(err => {
        return cbfn(err);
      });
    });
  }

  _delete(query, cbfn) {
    return this.legacyDatabase.deleteOne(this.collectionName, query, cbfn);
  }

  escapeRegExp(str) {
    return escapeRegExp(str);
  }

}

exports.LegacyCollection = LegacyCollection;