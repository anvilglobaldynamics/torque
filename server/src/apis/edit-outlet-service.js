const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.EditOutletServiceApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({

      serviceId: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().min(0).max(999999999999999).required()

    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "inventory",
        query: ({ inventoryId }) => ({ id: inventoryId }),
        select: "organizationId",
        errorCode: "INVENTORY_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_ALL_SERVICE_BLUEPRINTS"
      ]
    }];
  }

  async handle({ body }) {
    let { serviceId, salePrice } = body;
    return { status: "success" };
  }

}