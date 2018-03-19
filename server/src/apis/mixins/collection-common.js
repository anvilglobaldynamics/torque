
exports.collectionCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _deleteDocById(collection, query, cbfn) {
    collection.delete(query, (err, wasUpdated) => {
      if (err) return this.fail(err);
      if (!wasUpdated) return this.fail(new Error(`Unable to find ${collection.collectionName} to delete.`));
      return cbfn();
    });
  }

  _discardDocById(collection, query, cbfn) {
    collection.discard(query, (err, wasUpdated) => {
      if (err) return this.fail(err);
      if (!wasUpdated) return this.fail(new Error(`Unable to find ${collection.collectionName} to discard.`));
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

  _ensureUpdate(err, wasUpdated, collectionName) {
    if (err) {
      this.fail(err);
      return false;
    }
    if (!wasUpdated) {
      err = new Error(`Unable to find ${collectionName} to update`);
      err.code = "GENERIC_UPDATE_FAILURE";
      err.collectionName = collectionName;
      this.fail(err);
      return false;
    }
    return true
  }

}