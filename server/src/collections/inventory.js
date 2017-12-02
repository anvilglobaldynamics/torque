const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.InventoryCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'inventory';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      inventoryContainerId: Joi.number().max(999999999999999).required(),
      type: Joi.string().valid('default', 'returned', 'damaged').required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      allowManualTransfer: Joi.boolean().required(),
      productList: Joi.array().items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      ).required(),
      isDeleted: Joi.boolean().required()
    });

    this.uniqueDefList = [
      {
        additionalQueryFilters: {},
        uniqueKeyList: []
      }
    ]
  }

  create({ inventoryContainerId, organizationId, type, name, allowManualTransfer }, cbfn) {
    let doc = {
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      name,
      organizationId,
      inventoryContainerId,
      type,
      allowManualTransfer,
      productList: [],
      isDeleted: false
    }
    this._insert(doc, (err, id) => {
      return cbfn(err, id);
    });
  }

  addProduct({ inventoryId, productId, count }, cbfn) {
    let modifications = {
      $push: { productList: { productId, count } }
    }
    this._update({ id: inventoryId }, modifications, cbfn);
  }

  listByInventoryContainerId(inventoryContainerId, cbfn) {
    this._find({ inventoryContainerId }, cbfn);
  }

  updateProductList({ inventory }, cbfn) {
    let modifications = {
      $set: {
        productList: inventory.productList
      }
    }
    this._update({ id: inventory.id }, modifications, cbfn);
  }

  getById(inventoryId, cbfn) {
    this._findOne({ id: inventoryId }, cbfn)
  }

}