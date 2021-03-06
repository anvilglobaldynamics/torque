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
        errorCode: "SERVICE_BLUEPRINT_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_ALL_SERVICE_BLUEPRINTS"
      ],
      moduleList: [
        "MOD_SERVICE",
      ]
    }];
  }

  async _updateServiceBlueprint({ serviceBlueprintId, name, defaultVat, defaultSalePrice, isLongstanding, serviceDuration, isEmployeeAssignable, isCustomerRequired, isRefundable }) {
    let result = await this.database.serviceBlueprint.setDetails({ id: serviceBlueprintId }, { name, defaultVat, defaultSalePrice, isLongstanding, serviceDuration, isEmployeeAssignable, isCustomerRequired, isRefundable });
    this.ensureUpdate(result, 'service-blueprint');
    return;
  }

  async _updateExistingService({ serviceBlueprintId, salePrice }) {
    let service = await this.database.service._findOne({ serviceBlueprintId });
    if (service) {
      let result = await this.database.service.setDetails({ id: service.id }, {
        salePrice,
        isAvailable: service.isAvailable
      })
      this.ensureUpdate(result, 'service');
    }
  }

  async handle({ body }) {
    let { serviceBlueprintId, name, defaultVat, defaultSalePrice, isLongstanding, serviceDuration, isEmployeeAssignable, isCustomerRequired, isRefundable } = body;
    this.__isLongstandingServiceSetupValid({ isLongstanding, serviceDuration, isCustomerRequired });
    this.__isVatPercentageValid({ vat: defaultVat });
    await this._updateServiceBlueprint({ serviceBlueprintId, name, defaultVat, defaultSalePrice, isLongstanding, serviceDuration, isEmployeeAssignable, isCustomerRequired, isRefundable });
    await this._updateExistingService({ serviceBlueprintId, salePrice: defaultSalePrice });
    return { status: "success" };
  }

}