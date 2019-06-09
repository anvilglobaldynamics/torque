
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { SecurityMixin } = require('./mixins/security-mixin');
const { generateRandomString } = require('./../utils/random-string');

exports.AdminLoginApi = class extends Api.mixin(SecurityMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().min(8).max(30).required()
    });
  }

  async __createSession({ username }) {
    do {
      var apiKey = generateRandomString(64);
      var isUnique = await this.database.adminSession.isApiKeyUnique({ apiKey });
    } while (!isUnique);
    let sessionId = await this.database.adminSession.create({ username, apiKey });
    return { apiKey, sessionId };
  }

  _getAdmin({ username, password }) {
    let passwordHash = this._makeHash(password);
    let admin = this.server.config.admin.list.find(admin => {
      return (admin.username === username && admin.passwordHash === passwordHash);
    });
    throwOnFalsy(admin, "ADMIN_INVALID", "Unable to find admin with that username and password");
    return admin;
  }

  async handle({ body }) {
    let { username, password } = body;
    let admin = await this._getAdmin({ username, password });
    let session = await this.__createSession({ username });
    let { apiKey, sessionId } = session;
    let { rights } = admin;
    
    return {
      status: "success",
      apiKey,
      sessionId,
      admin: {
        username,
        rights
      }
    };
  }

}