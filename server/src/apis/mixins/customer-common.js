
exports.customerCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _verifyCustomerExist({ customerId }, cbfn) {
    this.database.customer.findById({ customerId }, (err, customer) => {
      if (!this._ensureDoc(err, customer, "CUSTOMER_INVALID", "Customer not found.")) return;
      cbfn(customer);
    });
  }

}