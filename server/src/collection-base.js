
let Joi = require('joi');

let { ensureKeysAreUnique } = require('./utils/ensure-unique');

class Collection {

  constructor(database) {
    this.database = database;
    this.collectionName = null; // subclass needs to define this property
    this.joiSchema = null; // subclass needs to define this property
    this.uniqueKeyDefList = null; // subclass needs to define this property
    this.foreignKeyDefList = null; // subclass needs to define this property
  }

  __validateAgainstSchema(doc, cbfn) {
    let { error: err } = Joi.validate(doc, this.joiSchema, {
      convert: false
    });
    if (err) return cbfn(err);
    cbfn();
  }
  
  /*
   Validates a document against a schema. Also checks if keys are unique.
   uniqueKeyDefList = [
     {
       additionalQueryFilters: additional query to isolate a collection (i.e. by organizationId etc...)
       keyList: list of keys that need to be unique.
     }
   ]
   */
  __validateDocument(doc, cbfn) {
    let { error: err } = Joi.validate(doc, this.joiSchema, {
      convert: false
    });
    if (err) return cbfn(err);

    let promiseList = this.uniqueKeyDefList.map(uniqueKeyDef => {
      return new Promise((accept, reject) => {
        let { additionalQueryFilters, keyList } = uniqueKeyDef;
        ensureKeysAreUnique(this.database, this.collectionName, additionalQueryFilters, doc, keyList, (err) => {
          if (err) return reject(err);
          accept();
        });
      });
    });
    Promise.all(promiseList).then(_ => {
      cbfn();
    }).catch(err => {
      cbfn(err);
    });
  }

  __updateOneSafe(query, modifications, cbfn) {
    this.database.findOne(this.collectionName, query, (err, originalDoc) => {
      if (err) return cbfn(err);
      this.database.updateOne(this.collectionName, query, modifications, (err, wasSuccessful) => {
        if (err) return cbfn(err);
        this.database.findOne(this.collectionName, query, (err, updatedDoc) => {
          if (err) return cbfn(err);
          this.__validateAgainstSchema(this.updatedDoc, (err) => {
            if (err) {
              this.database.replaceOne(this.collectionName, { id: originalDoc.id }, originalDoc, (err, wasUpdated) => {
                cbfn(err, false);
              })
            } else {
              cbfn(null, true);
            }
          });
        });
      });
    });
  }

  _find(query, ...args) {
    return this.database.find(this.collectionName, query, ...args);
  }

  _findOne(query, ...args) {
    return this.database.findOne(this.collectionName, query, ...args);
  }

  _insert(doc, cbfn) {
    this.__validateDocument(doc, (err) => {
      if (err) return cbfn(err);
      this.database.autoGenerateKey(this.collectionName, (err, id) => {
        if (err) return cbfn(err);
        doc.id = id;
        this.database.insertOne(this.collectionName, doc, (err, wasInserted) => {
          if (err) return cbfn(err);
          if (!wasInserted) return cbfn(new Error(`Could not insert ${this.collectionName} for reasons unknown.`));
          return cbfn(null, id);
        });
      });
    });
  }

  _update(query, modifications, cbfn) {
    return this.__updateOneSafe(query, modifications, cbfn);
    // return this.database.updateOne(this.collectionName, query, modifications, cbfn);
  }

  _delete(query, cbfn) {
    return this.database.insertOne(this.collectionName, query, cbfn);
  }

}

exports.Collection = Collection;