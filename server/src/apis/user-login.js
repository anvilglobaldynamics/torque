
const { Api } = require('./../api-base');
const Joi = require('joi');
const { generateRandomString } = require('./../utils/random-string');

const PHONE_VERIFICATION_WINDOW = 1 * 60 * 60 * 1000;

exports.UserLoginApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      emailOrPhone: Joi.alternatives([
        Joi.string().email().min(3).max(30), // if email
        Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15) // if phone
      ]).required(),
      password: Joi.string().min(8).max(30).required()
    });
  }

  async handle({ body }) {
    let { emailOrPhone, password } = body;
    console.log(emailOrPhone, password)
    return {message: "THANK YOU!"}
  }

}