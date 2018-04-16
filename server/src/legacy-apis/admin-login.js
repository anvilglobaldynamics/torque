
let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');
let { generateRandomString } = require('./../utils/random-string');

let { userCommonMixin } = require('./mixins/user-common');

exports.AdminLoginApi = class extends userCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().min(8).max(30).required()
    });
  }

  _getAdminIfValid({ username, password }, cbfn) {
    let passwordHash = this._makeHash(password);
    let admin = this.server.config.admin.list.find(admin => {
      return (admin.username === username && admin.passwordHash === passwordHash);
    });
    if (!admin) {
      let err = new Error("Unable to find admin with that username and password");
      err.code = "ADMIN_INVALID";
      return this.fail(err);
    }
    return cbfn(admin);
  }

  _createSession({ username }, cbfn) {
    let apiKey = generateRandomString(64);
    this.legacyDatabase.adminSession.isApiKeyUnique({ apiKey }, (err, isUnique) => {
      if (err) return this.fail(err);
      if (!isUnique) return this._createSession({ username }, cbfn);
      this.legacyDatabase.adminSession.create({ username, apiKey }, (err, sessionId) => {
        if (err) return this.fail(err);
        return cbfn({ apiKey, sessionId });
      });
    })
  }

  handle({ body }) {
    let { username, password } = body;
    this._getAdminIfValid({ username, password }, (admin) => {
      this._createSession({ username }, ({ apiKey, sessionId }) => {
        let {
          username,
          rights
        } = admin;
        this.success({
          status: "success",
          apiKey,
          sessionId,
          admin: {
            username,
            rights
          }
        });
      });
    });
  }

}

