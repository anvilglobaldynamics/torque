const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { ProductBlueprintMixin } = require('./mixins/product-blueprint-mixin');

exports.BulkImportProductBlueprintsApi = class extends Api.mixin(ProductBlueprintMixin) {

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
      Joi.string().valid('percent', 'fixed').required(), //defaultDiscountType
      Joi.number().max(999999999999999).required(), // defaultDiscountValue (MUST be validated separately)
      Joi.string().valid('Yes', 'No').required() // is converted into isReturnable
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
    value[7] = (value[7] === 'Yes');
    return value;
  }

  _convertRowToProductBlueprint(row) {
    let [
      name, unit, defaultPurchasePrice, defaultSalePrice,
      defaultVat, defaultDiscountType, defaultDiscountValue, isReturnable
    ] = row;
    return {
      name, unit, defaultPurchasePrice, defaultSalePrice,
      defaultVat, defaultDiscountType, defaultDiscountValue, isReturnable
    }
  }

  async handle({ body }) {
    let { organizationId, rowList } = body;

    let productBlueprintList = [];

    // phase 1. detect issues pre-emptively.
    for (let i = 0; i < rowList.length; i++) {
      try {
        rowList[i] = this._validateAgainstRowSchema(rowList[i]);
        let productBlueprint = this._convertRowToProductBlueprint(rowList[i]);
        this._checkIfDiscountValueIsValid(productBlueprint);
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
        await this._createProductBlueprint(productBlueprint);
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

