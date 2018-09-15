const { Api } = require('./../api-base');
const Joi = require('joi');

exports.GetProductCategoryListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privileges: [
        "PRIV_VIEW_ALL_INVENTORIES"
      ]
    }];
  }

  async _getProductCategoryList({ organizationId }) {
    return await this.database.productCategory.listByOrganizationId({ organizationId });
  }

  async handle({ body }) {
    let { organizationId } =  body;
    let productCategoryList = await this._getProductCategoryList({ organizationId });
    return { productCategoryList };
  }

}