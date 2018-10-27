const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { ServiceBlueprintMixin } = require('./mixins/service-blueprint-mixin');
const { ServiceMixin } = require('./mixins/service-mixin');

exports.AddServiceBlueprintApi = class extends Api.mixin(ServiceBlueprintMixin, ServiceMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
    
      defaultVat: Joi.number().min(0).max(999999999999999).required(),
      defaultSalePrice: Joi.number().min(0).max(999999999999999).required(),
      
      isLongstanding: Joi.boolean().required(),
      serviceDuration: Joi.object().allow(null).required().keys({
        months: Joi.number().min(0).max(999999999999999).required(),
        days: Joi.number().min(0).max(999999999999999).required(),
      }),
    
      isEmployeeAssignable: Joi.boolean().required(),
      isCustomerRequired: Joi.boolean().required(),
      isRefundable: Joi.boolean().required(),
      avtivateInAllOutlets: Joi.boolean().required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MODIFY_ALL_SERVICE_BLUEPRINTS"
      ]
    }];
  }
  
  async _checkAndActivateServiceInAllOutlets({ organizationId, serviceBlueprintId, defaultSalePrice, userId }) {
    let outletList = await this.database.outlet.listByOrganizationId({ organizationId });
    for(let i=0; i<outletList.length; i++) {
      await this.__activateServiceInOutlet({ 
        createdByUserId: userId, 
        outletId: outletList[i].id, 
        serviceBlueprintId, 
        salePrice: defaultSalePrice 
      });
    }
    return;
  }

  async handle({ body, userId }) {
    let { organizationId, name, defaultVat, defaultSalePrice, isLongstanding, serviceDuration, isEmployeeAssignable, isCustomerRequired, isRefundable, avtivateInAllOutlets } = body;
    this.__isLongstandingServiceSetupValid({ isLongstanding, serviceDuration, isCustomerRequired });
    this.__isVatPercentageValid({ vat: defaultVat });
    let serviceBlueprintId = await this.database.serviceBlueprint.create({ organizationId, name, defaultVat, defaultSalePrice, isLongstanding, serviceDuration, isEmployeeAssignable, isCustomerRequired, isRefundable })
    if (avtivateInAllOutlets) {
      await this._checkAndActivateServiceInAllOutlets({ organizationId, serviceBlueprintId, defaultSalePrice, userId });
    }
    
    return { status: "success", serviceBlueprintId };
  }

}