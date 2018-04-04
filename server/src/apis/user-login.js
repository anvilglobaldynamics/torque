
let { Api } = require('./../api-base');
let Joi = require('joi');

let { generateRandomString } = require('./../utils/random-string');

let { userCommonMixin } = require('./mixins/user-common');

const PHONE_VERIFICATION_WINDOW = 1 * 60 * 60 * 1000;

exports.UserLoginApi = class extends userCommonMixin(Api) {

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

  /*
  Finds a matching user. 
  If the user does not exists, the response is failed
  If the user is not valid (verified), the response is failed.
  If the user is banned, the response is failed.
  */
  _getUserIfValid({ emailOrPhone, password }, cbfn) {
    let passwordHash = this._makeHash(password);
    this.database.user.findByEmailOrPhoneAndPasswordHash({ emailOrPhone, passwordHash }, (err, user) => {
      if (err) return this.fail(err);
      if (!user) {
        let err = new Error(this.verses.UserLoginApi.userNotFound);
        err.code = 'USER_NOT_FOUND';
        return this.fail(err);
      }
      if (user.isBanned) {
        let err = new Error(this.verses.UserLoginApi.userBanned);
        err.code = 'USER_BANNED';
        return this.fail(err);
      }
      let warning = [];
      if (emailOrPhone === user.phone && !user.isPhoneVerified) {
        this.database.phoneVerificationRequest.findByForPhone({ forPhone: user.phone }, (err, phoneVerificationRequest) => {
          if (err) return this.fail(err);
          if (!phoneVerificationRequest) {
            err = new Error(this.verses.UserLoginApi.phoneVerificationRequestNotFound);
            err.code = 'PHONE_VERIFICATION_REQUEST_NOT_FOUND';
            return this.fail(err);
          }
          let { createdDatetimeStamp, isVerificationComplete } = phoneVerificationRequest;
          if (!isVerificationComplete) {
            let now = (new Date).getTime();
            let diff = now - createdDatetimeStamp;
            if (diff < PHONE_VERIFICATION_WINDOW) {
              // TODO: Update warning to use PHONE_VERIFICATION_WINDOW instead of fixed value.
              warning.push(`You have less than 1 hour to verify your phone number "${user.phone}".`);
            } else {
              let err = new Error(this.verses.UserLoginApi.userRequiresPhoneVerification);
              err.code = 'USER_REQUIRES_PHONE_VERIFICATION';
              return this.fail(err);
            }
          }
          return cbfn({ user, warning });
        });
      } else if (emailOrPhone === user.email && !user.isEmailVerified) {
        this.database.emailVerificationRequest.findByForEmail({ forEmail: user.email }, (err, emailVerificationRequest) => {
          if (err) return this.fail(err);
          if (!emailVerificationRequest) {
            err = new Error(this.verses.UserLoginApi.emailVerificationRequestNotFound);
            err.code = 'EMAIL_VERIFICATION_REQUEST_NOT_FOUND';
            return this.fail(err);
          }
          let { createdDatetimeStamp, isVerificationComplete } = emailVerificationRequest;
          if (!isVerificationComplete) {
            let err = new Error(this.verses.UserLoginApi.userRequiresEmailVerification);
            err.code = 'USER_REQUIRES_EMAIL_VERIFICATION';
            return this.fail(err);
          }
          return cbfn({ user, warning });
        });
      } else {
        return cbfn({ user, warning });
      }
    });
  }

  _createSession(userId, cbfn) {
    let apiKey = generateRandomString(64);
    this.database.session.isApiKeyUnique({ apiKey }, (err, isUnique) => {
      if (err) return this.fail(err);
      if (!isUnique) return this._createSession({ userId }, cbfn);
      this.database.session.create({ userId, apiKey }, (err, sessionId) => {
        if (err) return this.fail(err);
        return cbfn({ apiKey, sessionId });
      });
    })
  }

  handle({ body }) {
    let { emailOrPhone, password } = body;
    this._getUserIfValid({ emailOrPhone, password }, ({ user, warning }) => {
      if (!warning) warning = '';
      this._createSession(user.id, ({ apiKey, sessionId }) => {
        let {
          id,
          fullName,
          email,
          phone,
          nid,
          physicalAddress,
          emergencyContact,
          bloodGroup,
          isEmailVerified,
          isPhoneVerified
        } = user;
        this.success({
          status: "success",
          apiKey,
          warning,
          sessionId,
          user: {
            id,
            fullName,
            email,
            phone,
            nid,
            physicalAddress,
            emergencyContact,
            bloodGroup,
            isEmailVerified,
            isPhoneVerified
          }
        });
      });
    });
  }

}

