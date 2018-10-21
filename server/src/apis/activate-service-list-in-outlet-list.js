const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { ServiceBlueprintMixin } = require('./mixins/service-blueprint-mixin');
const { ServiceMixin } = require('./mixins/service-mixin');
const { OutletMixin } = require('./mixins/outlet-mixin');

exports.ActivateServiceListInOutletListApi = class extends Api.mixin(ServiceBlueprintMixin, ServiceMixin, OutletMixin) {

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
      outletIdList: Joi.array().min(0).items(
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

  _validatePredeterminerSetup({ activateAllServices, serviceBlueprintList, activateInAllOutlets, outletIdList }) {
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
    for (let i=0; i<unrefinedServiceBlueprintList.length; i++) {
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
    let { organizationId, activateAllServices, serviceBlueprintList, activateInAllOutlets, outletIdList } = body;
    this._validatePredeterminerSetup({ activateAllServices, serviceBlueprintList, activateInAllOutlets, outletIdList });

    if (activateAllServices) {
      serviceBlueprintList = await this._populateServiceBlueprintList({ organizationId, serviceBlueprintList });
    } else {
      await this.__varifyServiceBlueprintList({ serviceBlueprintList });
    }

    if (activateInAllOutlets) {
      outletIdList = await this._populateOutletIdList({ organizationId, outletIdList }); 
    } else {
      await this.__varifyOutletIdList({ outletIdList });
    }

    for(let i=0; i<serviceBlueprintList.length; i++) {
      for(let j=0; j<outletIdList.length; j++) {
        await this.__activateServiceInOutlet({ 
          createdByUserId: userId, 
          outletId: outletIdList[j], 
          serviceBlueprintId: serviceBlueprintList[i].serviceBlueprintId, 
          salePrice: serviceBlueprintList[i].salePrice 
        });
      }
    }

    return { status: "success" };
  }

}