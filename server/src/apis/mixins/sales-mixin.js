const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../../utils/coded-error');

exports.SalesMixin = (SuperApiClass) => class extends SuperApiClass {

  async _getSales({ salesId }) {
    let sales = await this.database.sales.findById({ id: salesId });
    throwOnFalsy(sales, "SALES_INVALID", "Sales not found");
    return sales;
  }

  async _getSalesList({ organizationId, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate }) {
    let outletList = await this.database.outlet.listByOrganizationId({ organizationId });
    let outletIdList = outletList.map(outlet => outlet.id);
    let salesList = await this.database.sales.listByFilters({ outletIdList, outletId, customerId, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate });
    return salesList;
  } 

}