const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { ProductBlueprintMixin } = require('./mixins/product-blueprint-mixin');
const { InventoryMixin } = require('./mixins/inventory-mixin');

exports.BulkImportProductBlueprintsApi = class extends Api.mixin(ProductBlueprintMixin, InventoryMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      rowList: Joi.array().required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  get _productBlueprintRowSchema() {
    return Joi.array().ordered(
      Joi.string().min(1).max(64).required(), // name
      Joi.string().max(1024).required(), // unit
      Joi.number().max(999999999999999).required(), // defaultPurchasePrice
      Joi.number().max(999999999999999).required(), //defaultSalePrice
      Joi.number().max(999999999999999).required(), // defaultVat
      Joi.string().valid('Yes', 'No').required(), // is converted into isReturnable
      Joi.string().max(64).allow('').required(), // identifierCode
      Joi.string().max(64).allow('').required(), // productCategory
      Joi.string().max(64).allow('').required(), // productCategory2
      Joi.number().max(999999999999999).required() // defaultInventoryId
    );
  }

  _validateAgainstRowSchema(row) {
    let { error, value } = this.validate(row, this._productBlueprintRowSchema);
    if (error) {
      let { message, path } = error.details[0];
      let cellNumber = parseInt(path) + 1;
      message = message.replace('"' + path + '"', 'Cell #' + cellNumber);
      let err = new CodedError('MODIFIED_VALIDATION_ERROR', message);
      err.cellNumber = cellNumber;
      throw err;
    }
    value[5] = (value[5] === 'Yes');
    return value;
  }

  _convertRowToProductBlueprint(row) {
    let [
      name, unit, defaultPurchasePrice, defaultSalePrice,
      defaultVat, isReturnable, identifierCode, productCategoryName, productCategory2Name, defaultInventoryId
    ] = row;
    return {
      name, unit, identifierCode, defaultPurchasePrice, defaultSalePrice, productCategoryName, productCategory2Name, defaultInventoryId,
      defaultVat, isReturnable
    }
  }

  async __ensureIdentifierCodeIsUnique({ identifierCode, organizationId }) {
    if (identifierCode.length === 0) return;
    let existingBlueprintList = await this.database.productBlueprint._find({ identifierCode, organizationId });
    throwOnTruthy(existingBlueprintList.length > 0, "INVALID_IDENTIFIER_CODE", "The identifier code is already in use by another product blueprint.");
  }

  async handle({ body }) {
    let { organizationId, rowList } = body;

    let productBlueprintList = [];

    // phase 1. detect issues pre-emptively.
    for (let i = 0; i < rowList.length; i++) {
      try {
        rowList[i] = this._validateAgainstRowSchema(rowList[i]);
        let productBlueprint = this._convertRowToProductBlueprint(rowList[i]);
        productBlueprintList.push(productBlueprint);
      } catch (err) {
        err.rowNumber = i + 1;
        throw err;
      }
    }

    // phase 2. create product blueprints
    let ignoredRowList = [];
    let successfulCount = 0;
    for (let i = 0; i < productBlueprintList.length; i++) {
      let productBlueprint = productBlueprintList[i];
      try {
        productBlueprint.organizationId = organizationId;

        let { productCategoryName, defaultInventoryId, productCategory2Name } = productBlueprint;
        delete productBlueprint.productCategoryName;
        delete productBlueprint.productCategory2Name;
        delete productBlueprint.defaultInventoryId;

        // validate inventory
        let inventory = await this.database.inventory._findOne({ organizationId, id: defaultInventoryId });
        throwOnFalsy(inventory, "INVENTORY_INVALID", "Inventory is Invalid");

        // add or get product category
        let productCategory = await this.database.productCategory._findOne({ name: productCategoryName, organizationId });
        if (!productCategory) {
          await this.database.productCategory.create({
            name: productCategoryName,
            organizationId,
            colorCode: '000000'
          });
          productCategory = await this.database.productCategory._findOne({ name: productCategoryName, organizationId });
        }
        let productCategoryId = productCategory.id;

        // add or get product category 2
        let productCategory2 = await this.database.productCategory._findOne({ name: productCategory2Name, organizationId });
        if (!productCategory2) {
          await this.database.productCategory.create({
            name: productCategory2Name,
            organizationId,
            colorCode: '000000'
          });
          productCategory2 = await this.database.productCategory._findOne({ name: productCategory2Name, organizationId });
        }
        let productCategory2Id = productCategory2.id;

        // set product category id list
        productBlueprint.productCategoryIdList = [productCategoryId, productCategory2Id];

        // add product blueprint
        await this.__ensureIdentifierCodeIsUnique({ identifierCode: productBlueprint.identifierCode, organizationId });
        let productBlueprintId = await this._createProductBlueprint(productBlueprint);

        // add product to inventory
        let insertedProductList = await this._addProductToInventory({
          inventoryId: defaultInventoryId,
          productList: [{ count: 1, productBlueprintId }]
        });

        successfulCount += 1;
      } catch (err) {
        if (err.code && err.code.indexOf('DUPLICATE_') === 0) {
          ignoredRowList.push({ rowNumber: i + 1, reason: 'name-duplication' });
        } else {
          err.rowNumber = i + 1;
          throw err;
        }
      }
    }

    return { status: "success", ignoredRowList, successfulCount };
  }

}


