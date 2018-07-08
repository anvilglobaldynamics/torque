exports.outletCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _verifyOutletExist({ outletId }, cbfn) {
    this.legacyDatabase.outlet.findById({ outletId }, (err, outlet) => {
      if (!this._ensureDoc(err, outlet, "OUTLET_INVALID", "Outlet not found.")) return;
      return cbfn();
    })
  }

}