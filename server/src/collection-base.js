
let Joi = require('joi');

let { ensureKeysAreUnique } = require('./utils/ensure-unique');

class Collection {

  constructor(database) {
    this.database = database;
    this.collectionName = null; // subclass needs to define
    this.joiSchema = null; // subclass needs to define
    this.uniqueDefList = null; // subclass needs to define
  }

  /*
   Validates a document against a schema. Also checks if keys are unique.
   uniqueDefList = [
     {
       additionalQueryFilters: additional query to isolate a collection (i.e. by organizationId etc...)
       uniqueKeyList: list of keys that need to be unique.
     }
   ]
   */
  __validateDocument(doc, cbfn) {
    let { error: err } = Joi.validate(doc, this.joiSchema, {
      convert: false
    });
    if (err) return cbfn(err);

    let promiseList = this.uniqueDefList.map(uniqueDef => {
      return new Promise((accept, reject) => {
        let { additionalQueryFilters, uniqueKeyList } = uniqueDef;
        ensureKeysAreUnique(this.database, this.collectionName, additionalQueryFilters, doc, uniqueKeyList, (err) => {
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

  // __updateOneSafe(collectionName, query, modifications, schema, cbfn) {
  //   this.findOne(collectionName, query, (err, originalDoc) => {
  //     if (err) return cbfn(err);
  //     this.updateOne(collectionName, query, modifications, (err, wasSuccessful) => {
  //       if (err) return cbfn(err);
  //       this.findOne(collectionName, query, (err, updatedDoc) => {
  //         if (err) return cbfn(err);

  //       });
  //     });
  //   });
  //   // get original doc
  //   // do modiciation
  //   // get modified doc
  //   // validate modified doc
  //   // if ok return ok
  //   // else replace with original and return error

  // }

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
    return this.database.updateOne(this.collectionName, query, modifications, cbfn);
  }

  _delete(query, cbfn) {
    return this.database.insertOne(this.collectionName, query, cbfn);
  }

}

exports.Collection = Collection;