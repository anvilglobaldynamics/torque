const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');

exports.EditPaymentMethodApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      paymentMethodId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      monetaryAccountId: Joi.number().max(999999999999999).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "payment-method",
        query: ({ paymentMethodId }) => ({ id: paymentMethodId }),
        select: "organizationId",
        errorCode: "PAYMENT_METHOD_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_PAYMENT_METHODS"
      ]
    }];
  }

  async _updatePaymentMethod({ paymentMethodId, name, monetaryAccountId }) {
    let result = await this.database.paymentMethod.setDetails({ id: paymentMethodId }, { name, monetaryAccountId });
    this.ensureUpdate(result, 'payment-method');
    return;
  }

  async handle({ body }) {
    let { paymentMethodId, name, monetaryAccountId } = body;
    await this._updatePaymentMethod({ paymentMethodId, name, monetaryAccountId });
    return { status: "success" };
  }

}