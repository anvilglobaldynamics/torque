const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');

exports.EditProductCategoryApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      productCategoryId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(32).required(),
      colorCode: Joi.string().length(6).required(),
    });
  }

  // privilege is same as product-blueprint to reflect real life use case.
  // product blueprint and category is 1to1 relation
  get accessControl() {
    return [{
      organizationBy: {
        from: "product-category",
        query: ({ productCategoryId }) => ({ id: productCategoryId }),
        select: "organizationId",
        errorCode: "PRODUCT_CATEGORY_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  async _updateProductCategory({ productCategoryId, name, colorCode, }) {
    let result = await this.database.productCategory.setDetails({ id: productCategoryId }, { name, colorCode });
    this.ensureUpdate(result, 'product-category');
    return;
  }

  async handle({ body }) {
    let { productCategoryId, name, colorCode } = body;
    await this._updateProductCategory({ productCategoryId, name, colorCode });
    return { status: "success" };
  }

}