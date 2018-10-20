const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { ServiceBlueprintMixin } = require('./mixins/service-blueprint-mixin');

exports.AddServiceBlueprintApi = class extends Api.mixin(ServiceBlueprintMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
    
      defaultVat: Joi.number().max(999999999999999).required(),
      defaultSalePrice: Joi.number().max(999999999999999).required(),
      
      isLongstanding: Joi.boolean().required(),
      serviceDuration: Joi.object().allow(null).required().keys({
        months: Joi.number().min(0).max(999999999999999).required(),
        days: Joi.number().min(0).max(999999999999999).required(),
      }),
    
      isEmployeeAssignable: Joi.boolean().required(),
      isCustomerRequired: Joi.boolean().required(),
      isRefundable: Joi.boolean().required()
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

  async handle({ body }) {
    let { organizationId, name, defaultVat, defaultSalePrice, isLongstanding, serviceDuration, isEmployeeAssignable, isCustomerRequired, isRefundable } = body;
    let serviceBlueprintId = await this.database.serviceBlueprint.create({ organizationId, name, defaultVat, defaultSalePrice, isLongstanding, serviceDuration, isEmployeeAssignable, isCustomerRequired, isRefundable })
    return { status: "success", serviceBlueprintId };
  }

}