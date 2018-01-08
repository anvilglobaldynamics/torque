
exports.collectionCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _deleteDocById(collection, query, cbfn) {
    collection.delete(query, (err, wasUpdated) => {
      if (err) return this.fail(err);
      if (!wasUpdated) return this.fail(new Error(`Unable to find ${collection.collectionName} to delete.`));
      return cbfn();
    });
  }

  _ensureDoc(err, doc, errorCode, errorMessage) {
    if (err) {
      this.fail(err);
      return false;
    }
    if (!doc) {
      err = new Error(errorMessage);
      err.code = errorCode;
      this.fail(err);
      return false;
    }
    return true
  }

}