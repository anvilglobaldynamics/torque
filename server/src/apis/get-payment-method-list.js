
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetPaymentMethodListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['paymentMethodList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      paymentMethodIdList: Joi.array().items(Joi.number()).default([]).optional() 
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
    }];
  }

  async __getPaymentMethodList({ organizationId, paymentMethodIdList }) {
    if (paymentMethodIdList.length > 0) {
      let paymentMethodList = await this.database.paymentMethod.listByOrganizationIdAndIdList({ organizationId, idList: paymentMethodIdList });
      if (paymentMethodList.length !== paymentMethodIdList.length) {
        throw new CodedError("PAYMENT_METHOD_INVALID", "The payment method you provided is invalid");
      }
      return paymentMethodList;
    } else {
      return await this.database.paymentMethod.listByOrganizationId({ organizationId });
    }   
  }

  async handle({ body }) {
    let { organizationId , paymentMethodIdList} = body;
    let paymentMethodList = await this.__getPaymentMethodList({ organizationId, paymentMethodIdList });
    return { paymentMethodList };
  }

}