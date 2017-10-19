
exports.ensureKeysAreUnique = (db, collectionName, extraQuery, doc, uniqueKeyList, cbfn) => {
  let promiseList = [];
  for (let key of uniqueKeyList) {
    if (key in doc) {
      let promise = new Promise((resolve, reject) => {
        let query = { [key]: doc[key] };
        for (let fragment in extraQuery) {
          query[fragment] = extraQuery[fragment];
        }
        db.findOne(collectionName, query, (err, doc) => {
          if (err) return reject(err);
          err = new Error(`Duplicate value found for key ${key}`);
          err.code = `DUPLICATE_${key}`
          if (doc) return reject(err);
          resolve();
        });
      })
      promiseList.push(promise);
    }
  }
  Promise.all(promiseList)
    .then(_ => cbfn())
    .catch(err => cbfn(err));

}