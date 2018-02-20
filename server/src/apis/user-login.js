
let { Api } = require('./../api-base');
let Joi = require('joi');
let cryptolib = require('crypto');
let { generateRandomString } = require('./../utils/random-string');

const EMAIL_VERIFICATION_WINDOW = 15 * 24 * 60 * 60 * 1000;
const PHONE_VERIFICATION_WINDOW = 15 * 24 * 60 * 60 * 1000;

exports.UserLoginApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      emailOrPhone: Joi.alternatives([
        Joi.string().email().min(3).max(30), // if email
        Joi.string().alphanum().min(11).max(14), // if phone
      ]).required(),
      password: Joi.string().min(8).max(30).required()
    });
  }

  _makeHash(string) {
    return cryptolib.createHash('sha256').update(string).digest("hex");
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
        let err = new Error("No user matched the email and password combination");
        err.code = 'USER_NOT_FOUND';
        return this.fail(err);
      }
      if (user.isBanned) {
        let err = new Error("You have been banned from our system. Contact our adiminstrators if you believe it is a mistake.");
        err.code = 'USER_BANNED';
        return this.fail(err);
      }
      let warning = [];
      if (!user.isEmailVerified) {
        this.database.emailVerificationRequest.findByForEmail({ forEmail: user.email }, (err, emailVerificationRequest) => {
          if (err) return this.fail(err);
          if (!emailVerificationRequest) {
            err = new Error("Email verification request not found.")
            return this.fail(err);
          }
          let { createdDatetimeStamp, isVerificationComplete } = emailVerificationRequest;
          if (!isVerificationComplete) {
            let now = (new Date).getTime();
            let diff = now - createdDatetimeStamp;
            if (diff < EMAIL_VERIFICATION_WINDOW) {
              warning.push("You have less than 24 hours to verify your email address.");
            } else {
              let err = new Error("You need to verify your email address");
              err.code = 'USER_REQUIRES_EMAIL_VERIFICATION';
              return this.fail(err);
            }
          }
        });
      }
      if (!user.isPhoneVerified) {
        this.database.phoneVerificationRequest.findByForPhone({ forPhone: user.phone }, (err, phoneVerificationRequest) => {
          if (err) return this.fail(err);
          if (!phoneVerificationRequest) {
            err = new Error("Phone verification request not found.")
            return this.fail(err);
          }
          let { createdDatetimeStamp, isVerificationComplete } = phoneVerificationRequest;
          if (!isVerificationComplete) {
            let now = (new Date).getTime();
            let diff = now - createdDatetimeStamp;
            if (diff < PHONE_VERIFICATION_WINDOW) {
              warning.push("You have less than 24 hours to verify your phone number.");
            } else {
              let err = new Error("You need to verify your phone number.");
              err.code = 'USER_REQUIRES_PHONE_VERIFICATION';
              return this.fail(err);
            }
          }
        });
      }
      return cbfn({ user, warning });
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
          fullName,
          email,
          phone,
          nid,
          physicalAddress,
          emergencyContact,
          bloodGroup,
        } = user;
        this.success({
          status: "success",
          apiKey,
          warning,
          sessionId,
          user: {
            fullName,
            email,
            phone,
            nid,
            physicalAddress,
            emergencyContact,
            bloodGroup
          }
        });
      });
    });
  }

}

