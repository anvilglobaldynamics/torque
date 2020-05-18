const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { AccountingMixin } = require('./mixins/accounting-mixin');

exports.AddPaymentMethodApi = class extends Api.mixin(AccountingMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(32).required(),
      monetaryAccountId: Joi.number().max(999999999999999).required().allow(null), // to allow users without accounting
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MODIFY_PAYMENT_METHODS"
      ]
    }];
  }

  async handle({ body }) {
    let { organizationId, name, monetaryAccountId } = body;

    // set monetary account to cash if none provided
    if (!monetaryAccountId){
      monetaryAccountId = (await this.getAccountByCodeName({ organizationId, codeName: 'CASH' })).id;
    }

    let paymentMethodId = await this.database.paymentMethod.create({ organizationId, name, monetaryAccountId });

    return { status: "success", paymentMethodId };
  }

}