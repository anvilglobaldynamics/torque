
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { generateRandomString } = require('./../utils/random-string');
const { SecurityMixin } = require('./mixins/security-mixin');
const { UserMixin } = require('./mixins/user-mixin');

exports.UserEditProfileApi = class extends Api.mixin(UserMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      email: Joi.string().email().min(3).max(30).allow(null).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),

      fullName: Joi.string().min(1).max(64).required(),
      nid: Joi.string().allow('').min(16).max(16).required(),
      physicalAddress: Joi.string().allow('').min(1).max(128).required(),
      emergencyContact: Joi.string().allow('').min(1).max(128).required(),
      bloodGroup: Joi.string().allow('').min(2).max(3).required()
    });
  }

  async updateProfile({ userId, email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup }) {
    let user = await this.database.user.findById({ id: userId });
    throwOnFalsy(user, "USER_INAVLID", "User not found.");

    let result;

    if (user.email !== email) {
      let existingUser = (await this.database.user.findByEmailOrPhone({ emailOrPhone: email }));
      if (existingUser) {
        throw new CodedError("EMAIL_INVALID", "The email you provided is already in use");
      }
    }

    if (user.phone !== phone) {
      let existingUser = (await this.database.user.findByEmailOrPhone({ emailOrPhone: phone }));
      if (existingUser) {
        throw new CodedError("PHONE_INVALID", "The phone you provided is already in use");
      }
    }

    result = await this.database.user.setProfile({ id: userId }, {
      userId, email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup
    });
    this.ensureUpdate('user', result);

    if (user.email === email && user.phone === phone) return false;

    if (user.email !== email) {
      result = await this.database.user.setEmailVerificationStatus({ id: userId }, { isEmailVerified: false });
      this.ensureUpdate('user', result);

      let verificationLink = await this._createEmailVerificationRequest({ email, userId });
      this._sendEmailVerificationMail({ email, verificationLink });
    }

    if (user.phone !== phone) {
      result = await this.database.user.setPhoneVerificationStatus({ id: userId }, { isPhoneVerified: false });
      this.ensureUpdate('user', result);

      let verificationLink = await this._createPhoneVerificationRequest({ phone, userId });
      this._sendPhoneVerificationSms({ phone, verificationLink });
    }

    return true;
  }

  async handle({ userId, body }) {
    let { email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup } = body;
    let doesRequireLogin = await this.updateProfile({ userId, email, phone, fullName, nid, physicalAddress, emergencyContact, bloodGroup });
    return { status: "success", doesRequireLogin };
  }

}