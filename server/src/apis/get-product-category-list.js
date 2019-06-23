
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
      searchString: Joi.string().min(0).max(32).allow('').optional(),
      productCategoryIdList: Joi.array().items(Joi.number()).optional(),
      searchBySearchString: Joi.boolean().default(false).optional()
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

  async __getProductCategoryList({ organizationId, searchString, productCategoryIdList, searchBySearchString }) {
    if (!searchBySearchString) {
      productCategoryIdList = productCategoryIdList || [];
      return await this.database.productCategory.listByOrganizationIdAndIdList({ organizationId, idList: productCategoryIdList });
    } else {
      return await this.database.productCategory.listByOrganizationIdAndSearchString({ organizationId, searchString });
    }
  }

  async handle({ body }) {
    let { organizationId, searchString, productCategoryIdList, searchBySearchString } = body;
    let productCategoryList = await this.__getProductCategoryList({ organizationId, searchString, productCategoryIdList, searchBySearchString });
    return { productCategoryList };
  }

}