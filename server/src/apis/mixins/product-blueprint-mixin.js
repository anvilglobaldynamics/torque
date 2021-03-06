const { Api } = require('../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.ProductBlueprintMixin = (SuperApiClass) => class extends SuperApiClass {

  async _createProductBlueprint({ organizationId, name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, productCategoryIdList, isReturnable }) {
    return await this.database.productBlueprint.create({ originApp: this.clientApplication,  organizationId, name, unit, identifierCode, defaultPurchasePrice, defaultVat, defaultSalePrice, productCategoryIdList, isReturnable });
  }

  async _verifyProductBlueprintsExist({ productList }) {
    await this.crossmap({
      source: productList,
      sourceKey: 'productBlueprintId',
      target: 'productBlueprint',
      onError: (inventory) => { throw new CodedError("PRODUCT_BLUEPRINT_INVALID", "Unable to find all products in productList"); }
    });
  }

}