const { Api } = require('./../api-base');
const Joi = require('joi');

exports.GetCustomerSummaryListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['customerList']; }

  get requestSchema() {
    return Joi.object().keys({
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

  async _getCustomerList({ organizationId, searchString }) {
    return await this.database.customer.listByOrganizationIdAndSearchString({ organizationId, searchString });
  }

  async handle({ body }) {
    let { organizationId, searchString } = body;
    let customerList = await this._getCustomerList({ organizationId, searchString });
    return { customerList };
  }

}