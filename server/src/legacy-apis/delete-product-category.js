let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.DeleteProductCategoryApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      productCategoryId: Joi.number().max(999999999999999).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "product-category",
        query: ({ productCategoryId }) => ({ id: productCategoryId }),
        select: "organizationId",
        errorCode: "PRODUCT_CATEGORY_INVALID"
      },
      privileges: [
        "PRIV_MODIFY_ALL_INVENTORIES"
      ]
    }];
  }

  _checkAndDeleteProductCategory({ productCategoryId }, cbfn) {
    // FIXME: below method listChildren is not present anymore as product categories are flat
    this.legacyDatabase.productCategory.listChildren({ productCategoryId }, (err, productCategoryChildList) => {
      if (err) return this.fail(err);
      if (productCategoryChildList.length > 0) {
        err = new Error("product category is parent of atleast one category");
        err.code = "PRODUCT_CATEGORY_NOT_CHILDLESS";
        return this.fail(err);
      }
      this._deleteProductCategory({ productCategoryId }, cbfn);
    })
  }

  _deleteProductCategory({ productCategoryId }, cbfn) {
    this._deleteDocById(this.legacyDatabase.productCategory, { productCategoryId }, cbfn);
  }

  handle({ body, userId }) {
    let { productCategoryId } = body;
    this._checkAndDeleteProductCategory({ productCategoryId }, _ => {
      this.success({ status: "success" });
    });
  }

}