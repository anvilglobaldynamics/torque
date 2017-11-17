
const Joi = require('joi');

let { ensureKeysAreUnique } = require('./../utils/ensure-unique');

exports.customerMixin = (DatabaseClass) => class extends DatabaseClass {

  get customerSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().alphanum().min(11).max(14).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      balance: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),
      
      additionalPaymentHistory: Joi.array().items(
        Joi.object().keys({
          creditedDatetimeStamp: Joi.number().max(999999999999999).required(),
          acceptedByUserId: Joi.number().max(999999999999999).required(),
          amount: Joi.number().max(999999999999999).required()
        })
      )
    });
  }

  _validateCustomer(doc, cbfn) {
    let { error: err } = Joi.validate(doc, this.customerSchema, {
      convert: false
    });
    if (err) return cbfn(err);
    let uniqueKeyList = ['phone']
    ensureKeysAreUnique(this, 'customer', {}, doc, uniqueKeyList, (err) => {
      if (err) return cbfn(err);
      cbfn();
    });
  }

  _insertCustomer(doc, cbfn) {
    this._validateCustomer(doc, (err) => {
      if (err) return cbfn(err);
      this.autoGenerateKey('customer', (err, customerId) => {
        if (err) return cbfn(err);
        doc.id = customerId;
        this.insertOne('customer', doc, (err, count) => {
          if (err) return cbfn(err);
          if (count !== 1) return cbfn(new Error("Could not insert customer for reasons unknown."));
          return cbfn(null, customerId);
        });
      });
    });
  }

  _updateCustomer(query, modifications, cbfn) {
    this.update('customer', query, modifications, cbfn);
  }

  // public:

  createCustomer({ organizationId, fullName, phone, openingBalance }, cbfn) {
    let customer = {
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      fullName, 
      organizationId, 
      phone, 
      balance: openingBalance,
      additionalPaymentHistory: [{
        creditedDatetimeStamp: (new Date).getTime(),
        acceptedByUserId: 0, // FIXME:
        amount: openingBalance
      }],
      isDeleted: false
    }
    this._insertCustomer(customer, (err, id) => {
      return cbfn(err, id);
    })
  }

}
