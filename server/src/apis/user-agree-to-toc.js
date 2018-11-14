const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.UserAgreeToTocApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({});
  }

  get accessControl() {
    return [];
  }

  async handle({ body, userId }) {
    let agreedToTocDatetimeStamp = Date.now();
    let results = await this.database.user.setAgreedToTocDatetimeStamp({ id: userId }, { agreedToTocDatetimeStamp });
    this.ensureUpdate('user', results);
    return { status: "success", agreedToTocDatetimeStamp };
  }

}