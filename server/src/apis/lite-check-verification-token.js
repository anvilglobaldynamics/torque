
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { SecurityMixin } = require('./mixins/security-mixin');
const { UserMixin } = require('./mixins/user-mixin');
const { LiteMixin } = require('./mixins/lite-mixin');

exports.LiteCheckVerificationTokenApi = class extends Api.mixin(SecurityMixin, UserMixin, LiteMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get isEnabled() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      verificationToken: Joi.string().length(6).required()
    });
  }

  async handle({ body }) {

    let { phone, verificationToken } = body;

    await this.__validateLiteVerificationRequest({ verificationToken, phone });

    return { status: "success" };

  }

}