const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { ServiceBlueprintMixin } = require('./mixins/service-blueprint-mixin');

exports.EditServiceBlueprintApi = class extends Api.mixin(ServiceBlueprintMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      serviceBlueprintId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      defaultVat: Joi.number().min(0).max(999999999999999).required(),
      defaultSalePrice: Joi.number().min(0).max(999999999999999).required(),
      
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
      organizationBy: {
        from: "service-blueprint",
        query: ({ serviceBlueprintId }) => ({ id: serviceBlueprintId }),
        select: "organizationId",
        errorCode: "PRODUCT_BLUEPRINT_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS"
      ]
    }];
  }

  async _updateServiceBlueprint({ serviceBlueprintId, name, defaultVat, defaultSalePrice, isLongstanding, serviceDuration, isEmployeeAssignable, isCustomerRequired, isRefundable }) {
    let result = await this.database.serviceBlueprint.setDetails({ id: serviceBlueprintId }, { name, defaultVat, defaultSalePrice, isLongstanding, serviceDuration, isEmployeeAssignable, isCustomerRequired, isRefundable });
    this.ensureUpdate(result, 'service-blueprint');
  }

  async handle({ body }) {
    let { name, defaultVat, defaultSalePrice, isLongstanding, serviceDuration, isEmployeeAssignable, isCustomerRequired, isRefundable } = body;
    this._isLongstandingServiceSetupValid({ isLongstanding, serviceDuration });
    this._isVatPercentageValid({ vat: defaultVat });
    await this._updateServiceBlueprint({ name, defaultVat, defaultSalePrice, isLongstanding, serviceDuration, isEmployeeAssignable, isCustomerRequired, isRefundable });
    return { status: "success" };
  }

}