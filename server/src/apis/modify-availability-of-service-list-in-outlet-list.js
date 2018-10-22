const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { ServiceBlueprintMixin } = require('./mixins/service-blueprint-mixin');
const { ServiceMixin } = require('./mixins/service-mixin');
const { OutletMixin } = require('./mixins/outlet-mixin');

exports.ModifyAvailabilityOfServiceListInOutletListApi = class extends Api.mixin(ServiceBlueprintMixin, ServiceMixin, OutletMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      action: Joi.string().valid('mark-as-available', 'mark-as-unavailable').required(),

      performActionForAllServices: Joi.boolean().required(),
      serviceBlueprintList: Joi.array().min(0).items(
        Joi.object().keys({
          serviceBlueprintId: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().min(0).max(999999999999999).required()
        })
      ),

      performActionOnAllOutlets: Joi.boolean().required(),
      outletIdList: Joi.array().min(0).items(
        Joi.number().max(999999999999999)
      )
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MODIFY_ALL_SERVICES_AVAILABILITY_IN_ALL_OUTLETS"
      ]
    }];
  }

  _validatePredeterminerSetup({ performActionForAllServices, serviceBlueprintList, performActionOnAllOutlets, outletIdList }) {
    if (performActionForAllServices) {
      if (serviceBlueprintList.length !== 0) {
        throw new CodedError("PREDETERMINER_SETUP_INVALID", "Lists referred by true flag should be empty.");
      }
    } else {
      if (serviceBlueprintList.length === 0) {
        throw new CodedError("PREDETERMINER_SETUP_INVALID", "Lists referred by true flag should be empty.");
      }
    }

    if (performActionOnAllOutlets) {
      if (outletIdList.length !== 0) {
        throw new CodedError("PREDETERMINER_SETUP_INVALID", "Lists referred by true flag should be empty.");
      }
    } else {
      if (outletIdList.length === 0) {
        throw new CodedError("PREDETERMINER_SETUP_INVALID", "Lists referred by true flag should be empty.");
      }
    }
  }

  async _populateServiceBlueprintList({ organizationId, serviceBlueprintList }) {
    let unrefinedServiceBlueprintList = await this.database.serviceBlueprint.listByOrganizationId({ organizationId });
    for (let i = 0; i < unrefinedServiceBlueprintList.length; i++) {
      let { id, defaultSalePrice } = unrefinedServiceBlueprintList[i];
      serviceBlueprintList.push({
        serviceBlueprintId: id,
        salePrice: defaultSalePrice
      });
    }
    return serviceBlueprintList;
  }

  async _populateOutletIdList({ organizationId, outletIdList }) {
    let outletList = await this.database.outlet.listByOrganizationId({ organizationId });
    outletIdList = outletList.map(outlet => outlet.id);
    return outletIdList;
  }

  async handle({ body, userId }) {
    let { organizationId, action, performActionForAllServices, serviceBlueprintList, performActionOnAllOutlets, outletIdList } = body;
    this._validatePredeterminerSetup({ performActionForAllServices, serviceBlueprintList, performActionOnAllOutlets, outletIdList });

    if (performActionForAllServices) {
      serviceBlueprintList = await this._populateServiceBlueprintList({ organizationId, serviceBlueprintList });
    } else {
      await this.__varifyServiceBlueprintList({ serviceBlueprintList });
    }

    if (performActionOnAllOutlets) {
      outletIdList = await this._populateOutletIdList({ organizationId, outletIdList });
    } else {
      await this.__varifyOutletIdList({ outletIdList });
    }

    for (let i = 0; i < serviceBlueprintList.length; i++) {
      for (let j = 0; j < outletIdList.length; j++) {
        if (action === 'mark-as-available') {
          await this.__activateServiceInOutlet({
            createdByUserId: userId,
            outletId: outletIdList[j],
            serviceBlueprintId: serviceBlueprintList[i].serviceBlueprintId,
            salePrice: serviceBlueprintList[i].salePrice
          });
        }

        if (action === 'mark-as-unavailable') {
          await this.__deactivateServiceInOutlet({
            outletId: outletIdList[j],
            serviceBlueprintId: serviceBlueprintList[i].serviceBlueprintId
          });
        }
      }
    }

    return { status: "success" };
  }

}