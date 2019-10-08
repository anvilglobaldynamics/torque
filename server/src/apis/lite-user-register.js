
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { SecurityMixin } = require('./mixins/security-mixin');
const { UserMixin } = require('./mixins/user-mixin');
const { OrganizationMixin } = require('./mixins/organization-mixin');
const { LiteMixin } = require('./mixins/lite-mixin');

exports.LiteUserRegisterApi = class extends Api.mixin(SecurityMixin, UserMixin, OrganizationMixin, LiteMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get isEnabled() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationName: Joi.string().min(1).max(64).required(),
      categoryCode: Joi.string().required(),
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      password: Joi.string().min(8).max(30).required(),
      verificationToken: Joi.string().length(5).required(),
      hasAgreedToToc: Joi.boolean().required().valid(true)
    });
  }

  // FIXME: User mixin
  async __createUser({ fullName, phone, password, agreedToTocDatetimeStamp }) {
    let passwordHash = this._makeHash(password);
    let userId = await this.database.user.create({ fullName, phone, passwordHash, agreedToTocDatetimeStamp });
    return userId;
  }

  async handle({ body }) {
    let { fullName, phone, password, hasAgreedToToc } = body;

    let agreedToTocDatetimeStamp = (hasAgreedToToc ? Date.now() : null);

    await this.__validateLiteVerificationRequest({ verificationToken, phone });
    await this.database.phoneVerificationRequest.applyVerificationToken({ verificationToken });

    let userId = await this.__createUser({ fullName, phone, password, agreedToTocDatetimeStamp });


    return { status: "success", userId };
  }

}