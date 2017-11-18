
let { Api } = require('./../api-base');
let Joi = require('joi');

exports.AddOrganizationApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().alphanum().min(11).max(14).required(),
      email: Joi.string().email().min(3).max(30).required(),
    });
  }

  _createOrganization({ name, primaryBusinessAddress, phone, email }, cbfn) {
    // NOTE: Because all new organizations get 1 day of free access
    let date = (new Date)
    date.setHours((date.getHours() + 24));
    let licenceExpiresOnDatetimeStamp = date.getTime();

    let organization = {
      name, primaryBusinessAddress, phone, email,
      licenceExpiresOnDatetimeStamp
    }
    this.database.organization.create(organization, (err, organizationId) => {
      if (err) {
        if ('code' in err && err.code === 'DUPLICATE_email') {
          err = new Error("Provided email address is already in use");
          err.code = 'EMAIL_ALREADY_IN_USE';
        }
        if ('code' in err && err.code === 'DUPLICATE_phone') {
          err = new Error("Provided phone number is already in use");
          err.code = 'PHONE_ALREADY_IN_USE';
        }
        return this.fail(err);
      }
      return cbfn(organizationId);
    });
  }

  handle({ body }) {
    let { name, primaryBusinessAddress, phone, email } = body;
    this._createOrganization({ name, primaryBusinessAddress, phone, email }, (organizationId) => {
      this.success({ status: "success" });
    });
  }

}

