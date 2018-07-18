
exports.customerCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _getCustomer({ customerId }, cbfn) {
    if (customerId) {
      this.legacyDatabase.customer.findById({ customerId }, (err, customer) => {
        if (err) return this.fail(err);
        if (!this._ensureDoc(err, customer, "CUSTOMER_INVALID", "Customer not found.")) return;
        return cbfn(customer);
      });
    } else {
      return cbfn(null);
    }
  }

  _updateCustomerBalance({ diff, customer }, cbfn) {
    let balance = diff;
    let customerId = customer.id;
    this.legacyDatabase.customer.updateBalanceOnly({ customerId }, { balance }, (err) => {
      if (err) return this.fail(err);
      return cbfn();
    });
  }

  _adjustBalance({ customer, action, amount }, cbfn) {
    if (action === 'payment') {
      customer.balance += amount;
      return cbfn(customer);
    } else if (action === 'withdrawl') {
      customer.balance -= amount;
      return cbfn(customer);
    }
  }


  _adjustBalanceAndSave({ customer, action, amount }, cbfn) {
    if (action === 'payment') {
      customer.balance += amount;
    } else if (action === 'withdrawl') {
      customer.balance -= amount;
    }

    this.legacyDatabase.customer.updateBalanceOnly({ customerId: customer.id }, { balance: customer.balance }, (err) => {
      if (err) return this.fail(err);
      return cbfn();
    });
  }

  _verifyCustomerExist({ customerId }, cbfn) {
    this.legacyDatabase.customer.findById({ customerId }, (err, customer) => {
      if (!this._ensureDoc(err, customer, "CUSTOMER_INVALID", "Customer not found.")) return;
      cbfn(customer);
    });
  }

}