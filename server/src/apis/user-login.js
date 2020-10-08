
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { generateRandomString } = require('./../utils/random-string');
const { SecurityMixin } = require('./mixins/security-mixin');
const { UserMixin } = require('./mixins/user-mixin');

const EMAIL_VERIFICATION_WINDOW = 7 * 24 * 60 * 60 * 1000;
// const EMAIL_VERIFICATION_WINDOW = 1 * 1000;

exports.UserLoginApi = class extends Api.mixin(SecurityMixin, UserMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get isEnabled() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      emailOrPhone: Joi.alternatives([
        Joi.string().email().min(3).max(30), // if email
        Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14) // if phone
      ]).required(),
      countryCode: Joi.string().regex(/^[a-z0-9\+]*$/i).min(2).max(4).allow(null).required(),
      password: Joi.string().min(6).max(30).required()
    });
  }

  async __getUser({ countryCode, emailOrPhone, password }) {
    let passwordHash = this._makeHash(password);
    let user = await this.database.user.findByEmailAndPasswordHash({ countryCode, email: emailOrPhone, passwordHash });
    throwOnFalsy(user, "USER_NOT_FOUND", this.verses.userLoginApi.userNotFound);
    throwOnTruthy(user.isBanned, "USER_BANNED", this.verses.userLoginApi.userBanned);

    if (user.accessibleApplicationList.indexOf(this.clientApplication) === -1) {
      if (this.clientApplication === 'torque') {
        throw new CodedError("APP_ACCESS_DENIED", "You do not have access to Lipi for Business.");
      }
    }

    let warning = [];

    // NOTE: Legacy phone verification code. Remove once certain
    // if (emailOrPhone === user.phone && !user.isPhoneVerified && this.clientApplication === 'torque') {
    //   let phoneVerificationRequest = await this.database.phoneVerificationRequest.findByForPhone({ forPhone: user.phone });
    //   throwOnFalsy(phoneVerificationRequest, "PHONE_VERIFICATION_REQUEST_NOT_FOUND", this.verses.userLoginApi.phoneVerificationRequestNotFound);
    //   let { createdDatetimeStamp, isVerificationComplete } = phoneVerificationRequest;
    //   if (!isVerificationComplete) {
    //     let diff = Date.now() - createdDatetimeStamp;
    //     throwOnTruthy(diff > EMAIL_VERIFICATION_WINDOW, "USER_REQUIRES_PHONE_VERIFICATION", this.verses.userLoginApi.userRequiresPhoneVerification);
    //     diff = Math.round(diff / (1000 * 60))
    //     warning.push(`You have less than 1 hour to verify your phone number "${user.phone}".`);
    //   }
    // } else 

    if (emailOrPhone === user.email && !user.isEmailVerified && this.clientApplication === 'torque') {
      let emailVerificationRequest = await this.database.emailVerificationRequest.findByForEmail({ forEmail: user.email });

      // NOTE: If email verification requrest does not exist, skip
      // throwOnFalsy(emailVerificationRequest, "EMAIL_VERIFICATION_REQUEST_NOT_FOUND", this.verses.userLoginApi.emailVerificationRequestNotFound)

      if (emailVerificationRequest) {
        let { createdDatetimeStamp, isVerificationComplete } = emailVerificationRequest;
        if (!isVerificationComplete) {
          let diff = Date.now() - createdDatetimeStamp;
          throwOnTruthy(diff > EMAIL_VERIFICATION_WINDOW, "USER_REQUIRES_EMAIL_VERIFICATION", this.verses.userLoginApi.userRequiresEmailVerification);
        }
      }

    } else {
      'pass'
    }
    return ({ user, warning });
  }

  async __createSession({ userId }) {
    do {
      var apiKey = generateRandomString(64);
      var isUnique = await this.database.session.isApiKeyUnique({ apiKey });
    } while (!isUnique);
    let sessionId = await this.database.session.create({ originApp: this.clientApplication, userId, apiKey });
    return { apiKey, sessionId };
  }

  async __destroyExistingSessions({ userId }) {
    await this.database.session.expireByUserIdWhenLoggedInFromAnotherDevice({ userId });
  }

  async handle({ body }) {
    // let message = "Lipi for Business is under maintenance. Lipi’s service will be back at 11:00 PM Bangladesh time today. Thank you."
    // throw new CodedError("SERVER_UNDER_MAINTENANCE", message);
    let { countryCode, emailOrPhone, password } = body;
    let { user, warning } = await this.__getUser({ countryCode, emailOrPhone, password });
    await this.__destroyExistingSessions({ userId: user.id });
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
        'isPhoneVerified',
        'agreedToTocDatetimeStamp'
      ])
    }
  }

}