let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetCustomerSummaryListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privileges: [
        "PRIV_VIEW_CUSTOMER"
      ]
    }];
  }

  _getCustomerSummaryList({ organizationId }, cbfn) {
    this.database.customer.listByOrganizationId({ organizationId }, (err, customerList) => {
      if (err) return this.fail(err);
      return cbfn(customerList);
    });
  }

  handle({ body }) {
    let { organizationId } = body;
    this._getCustomerSummaryList({ organizationId }, (customerList) => {
      this.success({ customerList: customerList });
    });
  }

}