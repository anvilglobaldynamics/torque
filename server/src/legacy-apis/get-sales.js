let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.GetSalesApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      salesId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: [
        {
          from: "sales",
          query: ({ salesId }) => ({ id: salesId }),
          select: "outletId",
          errorCode: "SALES_INVALID"
        },
        {
          from: "outlet",
          query: ({ outletId }) => ({ id: outletId }),
          select: "organizationId"
        }
      ],
      privilegeList: [
        "PRIV_VIEW_SALES"
      ]
    }];
  }

  _getSales({ salesId }, cbfn) {
    this.legacyDatabase.sales.findById({ salesId }, (err, sales) => {
      if (!this._ensureDoc(err, sales, "SALES_INVALID", "Sales not found")) return;
      return cbfn(sales);
    });
  }

  _addReturnedProductCountToSales({ sales }, cbfn) {
    this.legacyDatabase.salesReturn.listBySalesId({ salesId: sales.id }, (err, salesReturnList) => {
      if (salesReturnList.length > 0) {
        salesReturnList.forEach(salesReturn => {
          salesReturn.returnedProductList.forEach(returnedProduct => {
            let matchingProduct = sales.productList.find(product => {
              return product.productId === returnedProduct.productId;
            });

            if (!('returnedProductCount' in matchingProduct)) {
              matchingProduct.returnedProductCount = 0;
            }
            matchingProduct.returnedProductCount += returnedProduct.count;
          });
        });
        return cbfn(sales);
      } else { 
        sales.productList.forEach(product => {
          product.returnedProductCount = 0;
        });
        return cbfn(sales); 
      }
    });
  }

  _fetchProductCategoryData({ sales }, cbfn) {
    let productIdList = sales.productList.map(product => product.productId);
    this.legacyDatabase.product.findByIdList({ idList: productIdList }, (err, productList) => {
      let productCategoryIdList = productList.map(product => product.productCategoryId);
      this.legacyDatabase.productCategory.listByIdList({ idList: productCategoryIdList }, (err, productCategoryList) => {
        productList.forEach(product => {
          let productCategory = productCategoryList.find(productCategory => productCategory.id === product.productCategoryId);
          let matchingProduct = sales.productList.find(salesProduct => salesProduct.productId === product.id);
          matchingProduct.productCategoryId = productCategory.id;
          matchingProduct.productCategoryName = productCategory.name;
          matchingProduct.productCategoryUnit = productCategory.unit;
          matchingProduct.productCategoryIsReturnable = productCategory.isReturnable;
        });
        return cbfn(sales);
      });
    });
  }

  handle({ body }) {
    let { salesId } = body;
    this._getSales({ salesId }, (sales) => {
      this._addReturnedProductCountToSales({ sales }, (sales) => {
        this._fetchProductCategoryData({ sales }, (sales) => {
          this.success({ sales: sales });
        });
      });
    });
  }

}