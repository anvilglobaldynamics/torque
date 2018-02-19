
exports.customerCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _getCustomer({ customerId }, cbfn) {
    if (customerId) {
      this.database.customer.findById({ customerId }, (err, customer) => {
        if (err) return this.fail(err);
        if (customer === null) {
          err = new Error("customer could not be found");
          err.code = "CUSTOMER_INVALID";
          return this.fail(err);
        }
        return cbfn(customer);
      });
    } else {
      return cbfn(null);
    }
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