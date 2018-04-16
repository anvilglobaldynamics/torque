let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.GetSalesReturnApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      salesReturnId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: [
        {
          from: "sales-return",
          query: ({ salesReturnId }) => ({ id: salesReturnId }),
          select: "salesId",
          errorCode: "SALES_RETURN_INVALID"
        },
        {
          from: "sales",
          query: ({ salesId }) => ({ id: salesId }),
          select: "outletId"
        },
        {
          from: "outlet",
          query: ({ outletId }) => ({ id: outletId }),
          select: "organizationId"
        }
      ],
      privileges: [
        "PRIV_VIEW_SALES_RETURN"
      ]
    }];
  }

  _getSalesReturn({ salesReturnId }, cbfn) {
    this.legacyDatabase.salesReturn.findById({ salesReturnId }, (err, salesReturn) => {
      if (!this._ensureDoc(err, salesReturn, "SALES_RETURN_INVALID", "Sales return not found")) return;
      return cbfn(salesReturn);
    });
  }

  _fetchProductCategoryData({ salesReturn }, cbfn) {
    let productIdList = salesReturn.returnedProductList.map(product => product.productId);
    this.legacyDatabase.product.findByIdList({ idList: productIdList }, (err, productList) => {
      let productCategoryIdList = productList.map(product => product.productCategoryId);
      this.legacyDatabase.productCategory.listByIdList({ idList: productCategoryIdList }, (err, productCategoryList) => {
        productList.forEach(product => {
          let productCategory = productCategoryList.find(productCategory => productCategory.id === product.productCategoryId);
          let matchingProduct = salesReturn.returnedProductList.find(salesReturnProduct => salesReturnProduct.productId === product.id);

          matchingProduct.productCategoryId = productCategory.id;
          matchingProduct.productCategoryName = productCategory.name;
          matchingProduct.productCategoryIsReturnable = productCategory.isReturnable;
        });
        return cbfn(salesReturn);
      });
    });
  }

  handle({ body }) {
    let { salesReturnId } = body;
    this._getSalesReturn({ salesReturnId }, (salesReturn) => {
      this._fetchProductCategoryData({ salesReturn }, (salesReturn) => {
        this.success({ salesReturn });
      });
    });
  }

}