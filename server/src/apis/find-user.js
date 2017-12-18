let { Api } = require('./../api-base');
let Joi = require('joi');

exports.FindUserApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      emailOrPhone: Joi.alternatives([
        Joi.string().email().min(3).max(30), // if email
        Joi.string().alphanum().min(11).max(14), // if phone
      ]).required()
    });
  }

  _findUser({ emailOrPhone }, cbfn) {
    this.database.user.findByEmailOrPhone({ emailOrPhone }, (err, user) => {
      if (err) return this.fail(err);
      if (user === null) {
        err = new Error("User with this phone/email does not exist");
        err.code = "USER_DOES_NOT_EXIST"
        return this.fail(err);
      }
      return cbfn(user);
    });
  }

  handle({ body }) {
    let { emailOrPhone } = body;
    this._findUser({ emailOrPhone }, (user) => {
      this.success({ user });
    });
  }

}