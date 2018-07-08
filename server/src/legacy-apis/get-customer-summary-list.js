let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

exports.GetCustomerSummaryListApi = class extends LegacyApi {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['customerList']; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      organizationId: Joi.number().max(999999999999999).required(),
      searchString: Joi.string().min(0).max(64).allow('').optional()
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

  _getCustomerSummaryList({ organizationId, searchString }, cbfn) {
    this.legacyDatabase.customer.listByOrganizationIdAndSearchString({ organizationId, searchString }, (err, customerList) => {
      if (err) return this.fail(err);
      return cbfn(customerList);
    });
  }

  handle({ body }) {
    let { organizationId, searchString = null } = body;
    this._getCustomerSummaryList({ organizationId, searchString }, (customerList) => {
      this.success({ customerList });
    });
  }

}