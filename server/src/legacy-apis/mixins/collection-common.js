exports.collectionCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _deleteDocById(collection, query, cbfn) {
    collection.delete(query, (err, wasUpdated) => {
      if (err) return this.fail(err);
      if (!wasUpdated) return this.fail(this.verses.collectionCommon.genericDeleteFailureFn(collection.collectionName));
      return cbfn();
    });
  }

  _discardDocById(collection, query, cbfn) {
    collection.discard(query, (err, wasUpdated) => {
      if (err) return this.fail(err);
      if (!wasUpdated) return this.fail(this.verses.collectionCommon.genericDiscardFailureFn(collection.collectionName));
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
      err = new Error(this.verses.collectionCommon.genericUpdateFailureFn(collectionName));
      err.code = "GENERIC_UPDATE_FAILURE";
      err.collectionName = collectionName;
      this.fail(err);
      return false;
    }
    return true
  }

}