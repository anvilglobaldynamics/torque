
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { generateRandomString } = require('./../utils/random-string');
const { SecurityMixin } = require('./mixins/security-mixin');
const { UserMixin } = require('./mixins/user-mixin');

exports.UserAssertApiKeyApi = class extends Api.mixin(SecurityMixin, UserMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({});
  }

  async __getUser({ userId }) {
    let user = await this.database.user.findById({ id: userId });
    throwOnFalsy(user, "USER_INVALID", "User could not be found");
    return { user, warning: [] };
  }

  async __getSession({ apiKey }) {
    let session = await this.database.sesssion.findByApiKey({ apiKey });
    throwOnFalsy(session, "APIKEY_INVALID", "Session could not be found using the ApiKey");
    return { sessionId: session.id };
  }

  async handle({ userId, apiKey }) {
    let { user, warning } = await this.__getUser({ userId });
    let { sessionId } = await this.__getSession({ apiKey });
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