
exports.salesCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _getSales({ salesId }, cbfn) {
    this.database.sales.findById({ salesId }, (err, sales) => {
      if (!this._ensureDoc(err, sales, "SALES_INVALID", "Sales not found")) return;
      return cbfn(sales);
    });
  }

  _getSalesList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }, cbfn) {
    this.database.outlet.listByOrganizationId({ organizationId }, (err, outletList) => {
      if (err) return this.fail(err);
      let outletIdList = outletList.map(outlet => outlet.id);
      this.database.sales.listByFilters({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }, (err, salesList) => {
        if (err) return this.fail(err);
        return cbfn(salesList);
      });
    });
  }
  
}