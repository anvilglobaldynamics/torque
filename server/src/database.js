
let { asyncIf } = require('baselib')

MongoClient = require('mongodb').MongoClient;

let make = (array, count) => {
  while (array.length < count) {
    array.unshift(undefined);
  }
  return array;
}

class Database {

  constructor(path) {
    this._mongodbPath = path;
    this._autoGeneratedKeyCollectionName = 'auto-generated-keys'
  }

  initialize(cbfn) {
    MongoClient.connect(this._mongodbPath, (err, db) => {
      if (err) return cbfn(err);
      this._mongodbConnection = db;
      return cbfn();
    });
  }

  getDatabaseHandle() {
    return this._mongodbConnection;
  }

  find(collectionName, query, ...args) {
    let [skip = 0, limit = null, sort = null, cbfn] = make(args, 4);
    try {
      let cursor = this._mongodbConnection.collection(collectionName).find(query);
      if (skip)
        cursor.skip(skip);
      if (limit)
        cursor.limit(limit);
      if (sort)
        cursor.sort(sort);
      cursor.toArray((err, docList) => {
        setImmediate(_ => cbfn(err, docList))
      });
    } catch (_err) {
      err = _err;
      setImmediate(_ => cbfn(err))
    }
    return;
  }

  findOne(collectionName, query, ...args) {
    let [skip = 0, sort = null, cbfn] = make(args, 3);
    this.find(collectionName, query, skip, 1, sort, (err, docList) => {
      if (err) return cbfn(err);
      if (docList.length === 1) {
        cbfn(null, docList.pop());
      } else {
        cbfn(null, null);
      }
      return;
    });
  }

  autoGenerateKey(collectionName, cbfn) {
    this.findOne(this._autoGeneratedKeyCollectionName, { which: 'only' }, (err, doc) => {
      if (err) return cbfn(err);
      let condition = asyncIf(doc)
      condition.else(done => {
        this.insertOne(this._autoGeneratedKeyCollectionName, { which: 'only' }, (err, count) => {
          if (err) return cbfn(err);
          this.findOne(this._autoGeneratedKeyCollectionName, { which: 'only' }, (err, _doc) => {
            if (err) return cbfn(err);
            doc = _doc;
          });
        });
      })
      condition.finally(_ => {
        if (!(collectionName in doc)) {
          doc[collectionName] = 0;
        } else {
          doc[collectionName] += 1;
        }
        this.replaceOne(this._autoGeneratedKeyCollectionName, { which: 'only' }, doc, (err, count) => {
          if (err) return cbfn(err);
          return cbfn(null, doc[collectionName]);
        });
      });
    });
  }

  insertOne(collectionName, doc, cbfn) {
    this._mongodbConnection.collection(collectionName).insertOne(doc, (err, results) => {
      if (err) return cbfn(err);
      return cbfn(null, results.insertedCount);
    });
  }

  replaceOne(collectionName, query, doc, cbfn) {
    this._mongodbConnection.collection(collectionName).replaceOne(query, doc, (err, results) => {
      if (err) return cbfn(err);
      return cbfn(null, results.modifiedCount);
    });
  }

  update(collectionName, query, modifications, cbfn) {
    this._mongodbConnection.collection(collectionName).updateMany(query, modifications, (err, results) => {
      if (err) return cbfn(err);
      return cbfn(null, results.modifiedCount);
    });
  }

  deleteMany(collectionName, query, cbfn) {
    this._mongodbConnection.collection(collectionName).deleteMany(query, (err, results) => {
      if (err) return cbfn(err);
      return cbfn(null, results.deletedCount);
    });
  }

  insertMany(collectionName, docList, cbfn) {
    this._mongodbConnection.collection(collectionName).insertMany(docList, (err, results) => {
      if (err) return cbfn(err);
      return cbfn(null, results.insertedCount);
    });
  }

}

let { userMixin } = require('./collections/user');
let { emailVerificationRequestMixin } = require('./collections/email-verification-request');
let { sessionMixin } = require('./collections/session');
let { organizationMixin } = require('./collections/organization');
let { customerMixin } = require('./collections/customer');

Database = userMixin(Database);
Database = emailVerificationRequestMixin(Database);
Database = sessionMixin(Database);
Database = organizationMixin(Database);
Database = customerMixin(Database);

exports.Database = Database;