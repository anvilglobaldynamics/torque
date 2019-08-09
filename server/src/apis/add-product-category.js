const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');

exports.AddProductCategoryApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(32).required(),
      colorCode: Joi.string().length(6).required(),
    });
  }

  // privilege is same as product-blueprint to reflect real life use case.
  // product blueprint and category is 1to1 relation
  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  async handle({ body }) {
    let { organizationId, name, colorCode } = body;
    let productCategoryId = await this.database.productCategory.create({ organizationId, name, colorCode });
    return { status: "success", productCategoryId };
  }

}