let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.GetSalesReturnApi = class extends collectionCommonMixin(LegacyApi) {

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
      privilegeList: [
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

  _fetchProductBlueprintData({ salesReturn }, cbfn) {
    let productIdList = salesReturn.returnedProductList.map(product => product.productId);
    this.legacyDatabase.product.findByIdList({ idList: productIdList }, (err, productList) => {
      let productBlueprintIdList = productList.map(product => product.productBlueprintId);
      this.legacyDatabase.productBlueprint.listByIdList({ idList: productBlueprintIdList }, (err, productBlueprintList) => {
        productList.forEach(product => {
          let productBlueprint = productBlueprintList.find(productBlueprint => productBlueprint.id === product.productBlueprintId);
          let matchingProduct = salesReturn.returnedProductList.find(salesReturnProduct => salesReturnProduct.productId === product.id);

          matchingProduct.productBlueprintId = productBlueprint.id;
          matchingProduct.productBlueprintName = productBlueprint.name;
          matchingProduct.productBlueprintIsReturnable = productBlueprint.isReturnable;
        });
        return cbfn(salesReturn);
      });
    });
  }

  handle({ body }) {
    let { salesReturnId } = body;
    this._getSalesReturn({ salesReturnId }, (salesReturn) => {
      this._fetchProductBlueprintData({ salesReturn }, (salesReturn) => {
        this.success({ salesReturn });
      });
    });
  }

}