let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetAggregatedInventoryDetailsApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      inventoryId: Joi.number().max(999999999999999).required()
    });
  }

  handle({ body }) {
    let { inventoryId } = body;
    // TODO: return productList, matchingProductList, matchingProductCategoryList
    this.success({});
  }

}