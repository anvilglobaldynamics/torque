
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
      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
    }];
  }

  async __getProductCategoryList({ organizationId }) {
    let productCategoryList = await this.database.productCategory.listByOrganizationId({ organizationId });
    return productCategoryList;
  }

  async handle({ body }) {
    let { organizationId } = body;
    let productCategoryList = await this.__getProductCategoryList({ organizationId });
    return { productCategoryList };
  }

}