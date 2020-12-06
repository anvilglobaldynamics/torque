
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { SecurityMixin } = require('./mixins/security-mixin');
const { UserMixin } = require('./mixins/user-mixin');

// RFC 2822 - https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
let emailRegex =  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

exports.UserRegisterApi = class extends Api.mixin(SecurityMixin, UserMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get isEnabled() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      fullName: Joi.string().min(1).max(64).required(),

      email: Joi.string().email().regex(emailRegex).min(3).max(30).required().error((errors) => {
        errors.forEach(error => {
          error.message = "Please enter a valid email";
        })
        return errors;
      }),

      password: Joi.string().min(6).max(30).required(),
      hasAgreedToToc: Joi.boolean().required().valid(true)
    });
  }

  async handle({ body }) {
    let { fullName, email, password, hasAgreedToToc } = body;

    let agreedToTocDatetimeStamp = (hasAgreedToToc ? Date.now() : null);

    let userId = await this._createUser({ fullName, email, password, agreedToTocDatetimeStamp, accessibleApplicationList: ['torque'] });

    let verificationLink = await this._createEmailVerificationRequest({ email, userId });
    this._sendEmailVerificationMail({ email, verificationLink });

    return { status: "success", userId };
  }

}