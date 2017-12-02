let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetProductCategoryListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  _getProductCategoryList(organizationId, cbfn) {
    this.database.productCategory.listByOrganizationId(organizationId, (err, productCategoryList) => {
      if (err) return this.fail(err);
      cbfn(productCategoryList);
    })
  }

  handle({ body }) {
    let { organizationId } =  body;
    this._getProductCategoryList(organizationId, (productCategoryList) => {
      this.success({ productCategoryList });
    });
  }

}