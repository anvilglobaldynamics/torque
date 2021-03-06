const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { ServiceMixin } = require('./mixins/service-mixin');

exports.EditOutletServiceApi = class extends Api.mixin(ServiceMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      serviceId: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().min(0).max(999999999999999).required(),
      isAvailable: Joi.boolean().required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: [
        {
          from: "service",
          query: ({ serviceId }) => ({ id: serviceId }),
          select: "outletId",
          errorCode: "SERVICE_INVALID"
        },
        {
          from: "outlet",
          query: ({ outletId }) => ({ id: outletId }),
          select: "organizationId",
          errorCode: "OUTLET_INVALID"
        }
      ],
      privilegeList: [
        "PRIV_MODIFY_ALL_SERVICE_BLUEPRINTS"
      ],
      moduleList: [
        "MOD_SERVICE",
      ]
    }];
  }

  async handle({ body }) {
    let { serviceId, salePrice, isAvailable } = body;
    await this.__updateService({ serviceId, salePrice, isAvailable });
    return { status: "success" };
  }

}