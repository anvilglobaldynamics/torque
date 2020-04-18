
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { ProductBlueprintMixin } = require('./mixins/product-blueprint-mixin');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { AccountingMixin } = require('./mixins/accounting-mixin');

exports.AddProductToInventoryApi = class extends Api.mixin(ProductBlueprintMixin, InventoryMixin, AccountingMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      inventoryId: Joi.number().max(999999999999999).required(),
      productList: Joi.array().min(1).items(
        Joi.object().keys({
          productBlueprintId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      ),
      vendorId: Joi.number().max(999999999999999).allow(null).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "inventory",
        query: ({ inventoryId }) => ({ id: inventoryId }),
        select: "organizationId",
        errorCode: "INVENTORY_INVALID"
      },
      privilegeList: [
        "PRIV_ADD_PRODUCTS_TO_ALL_INVENTORIES"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  async _verifyVendorIfNeeded({ vendorId, organizationId }) {
    if (vendorId) {
      let doc = await this.database.vendor.findByIdAndOrganizationId({ id: vendorId, organizationId });
      throwOnFalsy(doc, "VENDOR_INVALID", "Vendor not found.");
    }
  }

  async handle({ body, userId }) {
    let { inventoryId, productList, vendorId } = body;
    let { organizationId } = this.interimData;

    await this._verifyVendorIfNeeded({ vendorId, organizationId });

    await this._verifyProductBlueprintsExist({ productList });

    let insertedProductList = await this._addProductToInventory({ inventoryId, productList });
    let productAcquisitionId = await this._addAcquisitionRecord({ createdByUserId: userId, acquiredDatetimeStamp: (new Date).getTime(), inventoryId, productList: insertedProductList, vendorId, organizationId });

    let productAcquisition = await this.database.productAcquisition.findById({ id: productAcquisitionId });

    // get purchase price of products
    productList = await this.__getAggregatedProductList({ productList: JSON.parse(JSON.stringify(insertedProductList)) });
    productList.forEach(product => {
      product.purchasePrice = product.product.purchasePrice
      delete product.product;
    });

    await this.addProductAcquisitionInventoryTransaction({
      transactionData: {
        createdByUserId: userId,
        organizationId
      },
      operationData: { productList, productAcquisitionId, productAcquisitionNumber: productAcquisition.productAcquisitionNumber, vendorId }
    });

    return { status: "success", insertedProductList };
  }

}