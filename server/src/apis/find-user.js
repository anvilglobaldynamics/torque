let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { userCommonMixin } = require('./mixins/user-common');

exports.FindUserApi = class extends userCommonMixin(collectionCommonMixin(Api)) {

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

  handle({ body }) {
    let { emailOrPhone } = body;
    this._findUserByEmailOrPhone({ emailOrPhone }, (user) => {
      this.success({ user });
    });
  }

}