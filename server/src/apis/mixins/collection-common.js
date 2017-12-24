
exports.collectionCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _deleteDocById(collection, query, cbfn) {
    collection.delete(query, (err, wasUpdated) => {
      if (err) return this.fail(err);
      if (!wasUpdated) return this.fail(new Error(`Unable to find ${collection.collectionName} to delete.`));
      return cbfn();
    });
  }

}