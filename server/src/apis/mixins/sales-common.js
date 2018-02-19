
exports.salesCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _getSales({ salesId }, cbfn) {
    this.database.sales.findById({ salesId }, (err, sales) => {
      if (!this._ensureDoc(err, sales, "SALES_INVALID", "Sales not found")) return;
      return cbfn(sales);
    });
  }
  
}