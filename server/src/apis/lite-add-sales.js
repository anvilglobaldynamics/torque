const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { CustomerMixin } = require('./mixins/customer-mixin');
const { SalesMixin } = require('./mixins/sales-mixin');
const { ServiceMixin } = require('./mixins/service-mixin');
const { generateRandomStringCaseInsensitive } = require('./../utils/random-string');

exports.LiteAddSalesApi = class extends Api.mixin(InventoryMixin, CustomerMixin, SalesMixin, ServiceMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({

      outletId: Joi.number().max(999999999999999).required(),

      customer: Joi.object().keys({
        fullName: Joi.string().min(1).max(64).required(),
        phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).allow(null).required(),
        email: Joi.string().email().min(3).max(30).allow(null).required(),
      }).allow(null),

      productList: Joi.array().required().items(
        Joi.object().keys({
          productBlueprintId: Joi.number().max(999999999999999).allow(null).required(),
          name: Joi.string().min(1).max(64).required(),
          count: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().max(999999999999999).required(),
        })
      ),

      payment: Joi.object().required().keys({
        totalAmount: Joi.number().max(999999999999999).required(), // means total sale price of all products
        vatAmount: Joi.number().max(999999999999999).required(),
        vatPercentage: Joi.number().max(999999999999999).required(), // Note: Is moved to productList when processing.
        discountType: Joi.string().valid('percent', 'fixed').required(),
        discountValue: Joi.number().max(999999999999999).required(),
        discountedAmount: Joi.number().max(999999999999999).required(),
        serviceChargeAmount: Joi.number().max(999999999999999).required(),
        totalBillBeforeRounding: Joi.number().max(999999999999999).required(),
        roundedByAmount: Joi.number().max(999999999999999).required(),
        totalBilled: Joi.number().min(0).max(999999999999999).required(), // this is the final amount customer has to pay (regardless of the method)

        // NOTE: below is a single payment.
        paymentMethod: Joi.string().valid('cash', 'card', 'digital', 'change-wallet').required(),
        paidAmount: Joi.number().max(999999999999999).required(),
        changeAmount: Joi.number().max(999999999999999).required(),
      }),

    });
  }

  get accessControl() {
    return [{
      organizationBy: [
        {
          from: "outlet",
          query: ({ outletId }) => ({ id: outletId }),
          select: "organizationId",
          errorCode: "OUTLET_INVALID"
        }
      ],
      privilegeList: []
    }];
  }

  async __createOrReuseProductBlueprintAndProduct({ userId, organizationId, inventoryId, originalProduct }) {
    let {
      productBlueprintId,
      name,
      count,
      salePrice,
      vatPercentage,
    } = originalProduct;

    // Avoid name collision
    if (productBlueprintId === null) {
      let productBlueprint = await this.database.productBlueprint._findOne({ name });
      if (productBlueprint) {
        productBlueprintId = productBlueprint.id;
      }
    }

    if (productBlueprintId !== null) {
      // Update existing ProductBlueprint
      let result = await this.database.productBlueprint._update({
        id: productBlueprintId
      }, {
        $set: {
          name,
          defaultVat: vatPercentage,
          defaultSalePrice: salePrice
        }
      });
      this.ensureUpdate(result, 'product-blueprint');

      // Update existing Product
      result = await this.database.product._update({
        productBlueprintId
      }, {
        $set: {
          salePrice: salePrice
        }
      });
      this.ensureUpdate(result, 'product');

      // Add Product to Outlet's Default Inventory
      let insertedProductList = await this._addProductToInventory({
        inventoryId, productList: [
          { productBlueprintId, count }
        ]
      });
      await this._addAcquisitionRecord({ createdByUserId: userId, acquiredDatetimeStamp: (new Date).getTime(), inventoryId, productList: insertedProductList, vendorId: null, organizationId });

      // Return __addSales compatible product
      return [{
        productId: insertedProductList[0].productId,
        count,
        salePrice,
        vatPercentage,
      }, { productBlueprintId }];

    } else {
      // Create ProductBlueprint
      let productBlueprintId = await this.database.productBlueprint.create({
        organizationId,
        name,
        unit: "Unit",
        identifierCode: "",
        defaultPurchasePrice: 0,
        defaultVat: vatPercentage,
        defaultSalePrice: salePrice,
        productCategoryIdList: [],
        isReturnable: false
      })

      // Add Product to Outlet's Default Inventory
      let insertedProductList = await this._addProductToInventory({
        inventoryId, productList: [
          { productBlueprintId, count }
        ]
      });
      await this._addAcquisitionRecord({ createdByUserId: userId, acquiredDatetimeStamp: (new Date).getTime(), inventoryId, productList: insertedProductList, vendorId: null, organizationId });

      // Return __addSales compatible product
      return [{
        productId: insertedProductList[0].productId,
        count,
        salePrice,
        vatPercentage,
      }, { productBlueprintId }];
    }
  }

  async getCustomerId({ customer }) {
    if (!customer) return null;
    if (customer.email) {
      let existingCustomer = await this.database.customer._findOne({ email: customer.email });
      if (existingCustomer) {
        await this.database.customer._update({ email: customer.email }, { $set: { fullName: customer.fullName } })
        return existingCustomer.id;
      } else {
        return await this.database.customer.create({
          organizationId: this.interimData.organization.id,
          fullName: customer.fullName,
          phone: customer.phone,
          email: customer.email,
          address: ''
        });
      }
    } else {
      let existingCustomer = await this.database.customer._findOne({ phone: customer.phone });
      if (existingCustomer) {
        await this.database.customer._update({ phone: customer.phone }, { $set: { fullName: customer.fullName } })
        return existingCustomer.id;
      } else {
        return await this.database.customer.create({
          organizationId: this.interimData.organization.id,
          fullName: customer.fullName,
          phone: customer.phone,
          email: customer.email,
          address: ''
        });
      }
    }
  }

  async _createReceipt({ salesId, sendVia }) {
    do {
      var receiptToken = generateRandomStringCaseInsensitive(5).toLowerCase();
      var isUnique = await this.database.receipt.findByReceiptToken({ receiptToken });
    } while (!isUnique);
    let sentHistory = [];
    let receiptId = await this.database.receipt.create({ receiptToken, salesId, sentHistory });
    console.log({ receiptId, receiptToken })
  }

  async handle({ userId, body }) {
    let { outletId, customer, productList: originalProductList, payment: originalPayment } = body;
    let organizationId = this.interimData.organization.id;

    let { vatPercentage } = originalPayment;
    delete originalPayment.vatPercentage;

    let inventoryId = (await this.__getOutletDefaultInventory({ outletId })).id;

    let productBlueprintIdList = []; // necessary for unit testing
    let productList = [];
    for (let originalProduct of originalProductList) {
      originalProduct.vatPercentage = vatPercentage;
      let [product, productBlueprintId] = await this.__createOrReuseProductBlueprintAndProduct({ userId, organizationId, inventoryId, originalProduct });
      productList.push(product);
      productBlueprintIdList.push(productBlueprintId);
    };

    // Following fields are required by __addSales api
    let serviceList = [];
    let productsSelectedFromWarehouseId = null;
    originalPayment.discountPresetId = null;
    originalPayment.shouldSaveChangeInAccount = false;
    let assistedByEmployeeId = null;
    let wasOfflineSale = false;

    let customerId = await this.getCustomerId({ customer });

    let results = await this.__addSales({ userId, organizationId, outletId, customerId, productList, serviceList, assistedByEmployeeId, payment: originalPayment, productsSelectedFromWarehouseId, wasOfflineSale });
    results.productBlueprintIdList = productBlueprintIdList;

    await this._createReceipt({ salesId: results.salesId, sendVia: 'none' });

    return results;
  }

}