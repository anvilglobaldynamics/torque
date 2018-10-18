const { Api } = require('./../api-base');
const Joi = require('joi');

exports.GetProductCategoryListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['productCategoryList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      searchString: Joi.string().min(0).max(64).allow('').optional()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_ALL_INVENTORIES"
      ]
    }];
  }

  async _getProductCategoryList({ organizationId, searchString }) {
    return await this.database.productCategory.listByOrganizationIdAndSearchString({ organizationId, searchString });
  }

  async handle({ body }) {
    let { organizationId, searchString } = body;
    let productCategoryList = await this._getProductCategoryList({ organizationId, searchString });

    return { productCategoryList };
  }

}