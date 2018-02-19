
exports.customerCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _getCustomer({ customerId }, cbfn) {
    this.database.customer.findById({ customerId }, (err, customer) => {
      if (err) return this.fail(err);
      if (!this._ensureDoc(err, customer, "CUSTOMER_INVALID", "Customer not found.")) return;
      return cbfn(customer);
    });
  }

  _adjustCustomerBalance({ diff, customer }, cbfn) {
    let balance = diff;
    let customerId = customer.id;
    this.database.customer.updateBalanceOnly({ customerId }, { balance }, (err) => {
      if (err) return this.fail(err);
      return cbfn();
    });
  }

  _verifyCustomerExist({ customerId }, cbfn) {
    this.database.customer.findById({ customerId }, (err, customer) => {
      if (!this._ensureDoc(err, customer, "CUSTOMER_INVALID", "Customer not found.")) return;
      cbfn(customer);
    });
  }

}