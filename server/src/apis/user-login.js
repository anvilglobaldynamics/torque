
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { generateRandomString } = require('./../utils/random-string');
const { SecurityMixin } = require('./mixins/security-mixin');
const { UserMixin } = require('./mixins/user-mixin');

const PHONE_VERIFICATION_WINDOW = 1 * 60 * 60 * 1000;

exports.UserLoginApi = class extends Api.mixin(SecurityMixin, UserMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      emailOrPhone: Joi.alternatives([
        Joi.string().email().min(3).max(30), // if email
        Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15) // if phone
      ]).required(),
      password: Joi.string().min(8).max(30).required()
    });
  }

  async __getUser({ emailOrPhone, password }) {
    let passwordHash = this._makeHash(password);
    let user = await this.database.user.findByEmailOrPhoneAndPasswordHash({ emailOrPhone, passwordHash });
    throwOnFalsy(user, "USER_NOT_FOUND", this.verses.userLoginApi.userNotFound);
    throwOnTruthy(user.isBanner, "USER_BANNED", this.verses.userLoginApi.userBanned);

    let warning = [];
    if (emailOrPhone === user.phone && !user.isPhoneVerified) {
      let phoneVerificationRequest = this.database.phoneVerificationRequest.findByForPhone({ forPhone: user.phone });
      throwOnFalsy(phoneVerificationRequest, "PHONE_VERIFICATION_REQUEST_NOT_FOUND", this.verses.userLoginApi.phoneVerificationRequestNotFound);
      let { createdDatetimeStamp, isVerificationComplete } = phoneVerificationRequest;
      if (!isVerificationComplete) {
        let diff = Date.now() - createdDatetimeStamp;
        throwOnTruthy(diff > PHONE_VERIFICATION_WINDOW, "USER_REQUIRES_PHONE_VERIFICATION", this.verses.userLoginApi.userRequiresPhoneVerification);
        diff = Math.round(diff / (1000 * 60))
        warning.push(`You have less than 1 hour to verify your phone number "${user.phone}".`);
      }
    } else if (emailOrPhone === user.email && !user.isEmailVerified) {
      let emailVerificationRequest = this.database.emailVerificationRequest.findByForEmail({ forEmail: user.email });
      throwOnFalsy(emailVerificationRequest, "EMAIL_VERIFICATION_REQUEST_NOT_FOUND", this.verses.userLoginApi.emailVerificationRequestNotFound)
      throwOnFalsy(emailVerificationRequest.isVerificationComplete, "USER_REQUIRES_EMAIL_VERIFICATION", this.verses.userLoginApi.userRequiresEmailVerification)
    } else {
      'pass'
    }
    return ({ user, warning });
  }

  async __createSession({ userId }) {
    let apiKey = generateRandomString(64);
    do {
      var isUnique = await this.database.sesssion.isApiKeyUnique({ apiKey });
    } while (!isUnique);
    let sessionId = await this.database.sesssion.create({ userId, apiKey });
    return { apiKey, sessionId };
  }

  async handle({ body }) {
    let { emailOrPhone, password } = body;
    let { user, warning } = await this.__getUser({ emailOrPhone, password });
    let { apiKey, sessionId } = await this.__createSession({ userId: user.id });
    return {
      status: "success",
      apiKey,
      warning,
      sessionId,
      user: extract(user, [
        'id',
        'fullName',
        'email',
        'phone',
        'nid',
        'physicalAddress',
        'emergencyContact',
        'bloodGroup',
        'isEmailVerified',
        'isPhoneVerified'
      ])
    }
  }

}