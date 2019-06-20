
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

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
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  async __getProductCategoryList({ organizationId, searchString }) {
    let productCategoryList = await this.database.productCategory.listByOrganizationIdAndSearchString({ organizationId, searchString });
    return productCategoryList;
  }

  async handle({ body }) {
    let { organizationId, searchString } = body;
    let productCategoryList = await this.__getProductCategoryList({ organizationId, searchString });
    return { productCategoryList };
  }

}