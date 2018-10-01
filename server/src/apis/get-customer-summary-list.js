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

  async _getCustomerList({ organizationId }) {
    return await this.database.customer.listByOrganizationId({ organizationId });
  }

  async __searchCustomerList({ customerList, searchString }) {
    customerList = customerList.filter(customer => {
      let regex = new RegExp(searchString, 'g');
      return regex.test(customer.fullName);
    });

    return customerList;
  }

  async handle({ body }) {
    let { organizationId, searchString } =  body;
    let customerList = await this._getCustomerList({ organizationId });

    if (searchString) {
      customerList = await this.__searchCustomerList({ customerList, searchString });
    }

    return { customerList };
  }

}