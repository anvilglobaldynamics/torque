const { LegacyCollection } = require('./../legacy-collection-base');

/* =================================================================
+++++++++++++                   WARNING                +++++++++++++
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
++ This is a LegacyCollection. It uses async callbacks. New APIs  ++
++ should not be using this. Even when using with legacy APIs, if ++
++ you make a change, pleaase replicate the change in the         ++
++ non-legacy Collection of the same name.                        ++
++ Talk to @iShafayet if unsure.                                  ++
================================================================= */

const Joi = require('joi');

exports.InventoryCollection = class extends LegacyCollection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'inventory';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      inventoryContainerId: Joi.number().max(999999999999999).required(),
      inventoryContainerType: Joi.string().valid('outlet', 'warehouse').required(),
      type: Joi.string().valid('default', 'returned', 'damaged').required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
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
    ];

    this.foreignKeyDefList = [
      {
        targetCollection: 'organization',
        foreignKey: 'id',
        referringKey: 'organizationId'
      }
    ];

    // NOTES: inventoryContainerId is effectively a foreignKey. Since it may refer
    // to two collections, it's not checked.
  }

  create({ inventoryContainerId, inventoryContainerType, organizationId, type, name }, cbfn) {
    let doc = {
      name,
      organizationId,
      inventoryContainerId,
      inventoryContainerType,
      type,
      productList: [],
      isDeleted: false
    }
    this._insert(doc, (err, id) => {
      return cbfn(err, id);
    });
  }

  addProduct({ inventoryId }, { productId, count }, cbfn) {
    let modifications = {
      $push: { productList: { productId, count } }
    }
    this._update({ id: inventoryId }, modifications, cbfn);
  }

  listByInventoryContainerId({ inventoryContainerId, inventoryContainerType }, cbfn) {
    this._find({ inventoryContainerId, inventoryContainerType }, cbfn);
  }

  updateProductList({ inventoryId }, { productList }, cbfn) {
    let modifications = {
      $set: {
        productList
      }
    }
    this._update({ id: inventoryId }, modifications, cbfn);
  }

  findById({ inventoryId }, cbfn) {
    this._findOne({ id: inventoryId }, cbfn)
  }

  listByOrganizationId({ organizationId }, cbfn) {
    this._find({ organizationId }, cbfn);
  }

  deleteByInventoryContainerId({ inventoryContainerId }, cbfn) {
    let modifications = {
      $set: { isDeleted: true }
    }
    this._update({ inventoryContainerId }, modifications, cbfn);
  }

}