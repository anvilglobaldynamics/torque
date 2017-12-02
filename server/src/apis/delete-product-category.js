let { Api } = require('./../api-base');
let Joi = require('joi');

exports.DeleteProductCategoryApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      productCategoryId: Joi.number().max(999999999999999).required(),
    });
  }

  _checkAndDeleteProductCategory({ productCategoryId }, cbfn) {
    this.database.productCategory.listChildren({ productCategoryId }, (err, productCategoryChildList) => {
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
    this.database.productCategory.delete({ productCategoryId }, (err, wasUpdated) => {
      if (err) return this.fail(err);
      if (!wasUpdated) return this.fail(new Error('Unable to find product category to update'));
      return cbfn();
    });
  }

  handle({ body, userId }) {
    let { productCategoryId } = body;
    this._checkAndDeleteProductCategory({ productCategoryId }, _ => {
      this.success({ status: "success" });
    });
  }

}