const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { ServiceBlueprintMixin } = require('./mixins/service-blueprint-mixin');
const { ServiceMixin } = require('./mixins/service-mixin');

exports.ActivateServiceListInOutletListApi = class extends Api.mixin(ServiceBlueprintMixin, ServiceMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      activateAllServices: Joi.boolean().required(),
      serviceBlueprintList: Joi.array().min(0).items(
        Joi.object().keys({
          serviceBlueprintId: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().min(0).max(999999999999999).required()
        })
      ),
    
      activateInAllOutlets: Joi.boolean().required(),
      outletIdtList: Joi.array().min(0).items(
        Joi.number().max(999999999999999)
      )
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_ADD_PRODUCTS_TO_ALL_INVENTORIES"
      ]
    }];
  }

  _validatePredeterminerSetup({ activateAllServices, serviceBlueprintList, activateInAllOutlets, outletIdtList }) {
    if (activateAllServices) {
      if (serviceBlueprintList.length !== 0) {
        throw new CodedError("PREDETERMINER_SETUP_INVALID", "Lists referred by true flag should be empty.");
      }
    } else {
      if (serviceBlueprintList.length === 0) {
        throw new CodedError("PREDETERMINER_SETUP_INVALID", "Lists referred by true flag should be empty.");
      }
    }

    if (activateInAllOutlets) {
      if (outletIdtList.length !== 0) {
        throw new CodedError("PREDETERMINER_SETUP_INVALID", "Lists referred by true flag should be empty.");
      }
    } else {
      if (outletIdtList.length === 0) {
        throw new CodedError("PREDETERMINER_SETUP_INVALID", "Lists referred by true flag should be empty.");
      }
    }
  }

  async handle({ body, userId }) {
    let { organizationId, activateAllServices, serviceBlueprintList, activateInAllOutlets, outletIdtList } = body;
    this._validatePredeterminerSetup({ activateAllServices, serviceBlueprintList, activateInAllOutlets, outletIdtList });

    if (activateAllServices) {
      // populate serviceBlueprintList
    } else {
      // varify serviceBlueprintList
    }

    if (activateInAllOutlets) {
      // populate outletIdtList
    } else {
      // varify outletIdtList
    }

    return { status: "success" };
  }

}