
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { generateRandomString } = require('./../utils/random-string');
const { SecurityMixin } = require('./mixins/security-mixin');
const { UserMixin } = require('./mixins/user-mixin');

exports.UserLogoutApi = class extends Api.mixin(SecurityMixin, UserMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({});
  }

  async __getSession({ apiKey }) {
    let session = await this.database.sesssion.findByApiKey({ apiKey });
    throwOnFalsy(session, "APIKEY_INVALID", "Session could not be found using the ApiKey");
    return { sessionId: session.id };
  }

  async __closeSession({ sessionId }) {
    let result = await this.database.sesssion.close({ id: sessionId });
    this.ensureUpdate('session', result);
  }

  async handle({ userId, apiKey }) {
    let { sessionId } = await this.__getSession({ apiKey });
    await this.__closeSession({ sessionId });
    return { status: "success" };
  }

}