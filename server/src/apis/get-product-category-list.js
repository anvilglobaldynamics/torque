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
      privileges: [
        "PRIV_VIEW_ALL_INVENTORIES"
      ]
    }];
  }

  async _getProductCategoryList({ organizationId }) {
    return await this.database.productCategory.listByOrganizationId({ organizationId });
  }

  async __searchProductCategoryList({ productCategoryList, searchString }) {
    productCategoryList = productCategoryList.filter(productCategory => {
      let regex = new RegExp(searchString, 'g');
      return regex.test(productCategory.name);
    });

    return productCategoryList;
  }

  async handle({ body }) {
    let { organizationId, searchString } =  body;
    let productCategoryList = await this._getProductCategoryList({ organizationId });

    if (searchString) {
      productCategoryList = await this.__searchProductCategoryList({ productCategoryList, searchString });
    }

    return { productCategoryList };
  }

}