
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.TransferBetweenInventoriesApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      fromInventoryId: Joi.number().max(999999999999999).required(),
      toInventoryId: Joi.number().max(999999999999999).required(),

      productList: Joi.array().min(1).items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      ),
      vendorId: Joi.number().max(999999999999999).allow(null).required()
    });
  }

  get accessControl() {
    return [
      {
        organizationBy: {
          from: "inventory",
          query: ({ fromInventoryId }) => ({ id: fromInventoryId }),
          select: "organizationId",
          errorCode: "FROM_INVENTORY_INVALID"
        },
        privilegeList: ["PRIV_TRANSFER_ALL_INVENTORIES"]
      },
      {
        organizationBy: {
          from: "inventory",
          query: ({ toInventoryId }) => ({ id: toInventoryId }),
          select: "organizationId",
          errorCode: "TO_INVENTORY_INVALID"
        },
        privilegeList: [
          "PRIV_TRANSFER_ALL_INVENTORIES"
        ],
        moduleList: [
          "MOD_PRODUCT",
        ]
      }
    ];
  }

  async _getInventoriesWithId({ fromInventoryId, toInventoryId }) {
    let fromInventory = await this.database.inventory.findById({ id: fromInventoryId });
    throwOnFalsy(fromInventory, "FROM_INVENTORY_INVALID", "Inventory could not be found");
    let toInventory = await this.database.inventory.findById({ id: toInventoryId });
    throwOnFalsy(toInventory, "TO_INVENTORY_INVALID", "Inventory could not be found");
    return { fromInventory, toInventory };
  }

  _transfer({ fromInventory, toInventory, productList }) {
    for (let product of productList) {

      let foundProductList = fromInventory.productList.filter(_product => _product.productId === product.productId);
      if (foundProductList.length === 0) {
        throw new CodedError("PRODUCT_INVALID", "product could not be found in source inventory");
      }

      foundProductList.sort((a, b) => b.count - a.count);
      let foundProduct = foundProductList[0];

      if (foundProduct.count < product.count) {
        throw new CodedError("PRODUCT_INSUFFICIENT", "not enough product(s) in source inventory");
      }
      foundProduct.count -= product.count;

      foundProduct = toInventory.productList.find(_product => _product.productId === product.productId);
      if (!foundProduct) {
        toInventory.productList.push(product);
      } else {
        foundProduct.count += product.count;
      }
    }
  }

  async _updateInventories({ fromInventory, toInventory }) {
    let result = await this.database.inventory.setProductList({ id: fromInventory.id }, { productList: fromInventory.productList });
    this.ensureUpdate('inventory', result);
    result = await this.database.inventory.setProductList({ id: toInventory.id }, { productList: toInventory.productList });
    this.ensureUpdate('inventory', result);
  }

  async _addTransferRecord({ organizationId, createdByUserId, transferredDatetimeStamp, fromInventoryId, toInventoryId, productList, vendorId, isWithinSameInventoryContainer }) {
    await this.database.productTransfer.create({ organizationId, createdByUserId, transferredDatetimeStamp, fromInventoryId, toInventoryId, productList, vendorId, isWithinSameInventoryContainer });
  }

  async _verifyVendorIfNeeded({ vendorId, organizationId }) {
    if (vendorId) {
      let doc = await this.database.vendor.findByIdAndOrganizationId({ id: vendorId, organizationId });
      throwOnFalsy(doc, "VENDOR_INVALID", "Vendor not found.");
    }
  }

  async handle({ body, userId }) {
    let { fromInventoryId, toInventoryId, productList, vendorId } = body;
    let { organizationId } = this.interimData;

    await this._verifyVendorIfNeeded({ vendorId, organizationId });

    let { fromInventory, toInventory } = await this._getInventoriesWithId({ fromInventoryId, toInventoryId });

    let isWithinSameInventoryContainer = false;
    if (fromInventory.inventoryContainerId === toInventory.inventoryContainerId
      && fromInventory.inventoryContainerType === toInventory.inventoryContainerType) {
      isWithinSameInventoryContainer = true;
    }

    this._transfer({ fromInventory, toInventory, productList });
    await this._updateInventories({ fromInventory, toInventory });

    await this._addTransferRecord({ organizationId, createdByUserId: userId, transferredDatetimeStamp: (new Date).getTime(), fromInventoryId, toInventoryId, productList, vendorId, isWithinSameInventoryContainer });

    return { status: "success" };
  }

}