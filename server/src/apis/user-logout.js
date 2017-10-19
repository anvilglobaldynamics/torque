
let { Api } = require('./../api-base');
let Joi = require('joi');

exports.UserLogoutApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
    });
  }

  handle({ body, userId, apiKey }) {
    this.database.getSessionByApiKey(apiKey, (err, session)=>{
      if (err) return this.fail(err);
      this.database.closeSession(session.id, (err)=>{
        if (err) return this.fail(err);
        this.success({ status: "success" });
      })
    })
  }

}

