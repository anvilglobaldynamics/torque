
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

  _computeDefaultLisenceExpirationDate() {
    let date = (new Date);
    // NOTE: Because all new organizations get 1 day of free access
    date.setHours((date.getHours() + 24));
    return date.getTime();
  }

  _createOrganization({ name, primaryBusinessAddress, phone, email }, cbfn) {
    let licenceExpiresOnDatetimeStamp = this._computeDefaultLisenceExpirationDate();

    let organization = {
      name, primaryBusinessAddress, phone, email,
      licenceExpiresOnDatetimeStamp
    }
    this.database.organization.create(organization, (err, organizationId) => {
      if (err) return this.fail(err);
      return cbfn(organizationId);
    });
  }

  _setUserAsOwner({ userId, organizationId }, cbfn) {
    this.database.employment.employNewEmployeeAsOwner({ userId, organizationId }, (err) => {
      if (err) return this.fail(err);
      cbfn();
    })
  }

  handle({ body, userId }) {
    let { name, primaryBusinessAddress, phone, email } = body;
    this._createOrganization({ name, primaryBusinessAddress, phone, email }, (organizationId) => {
      this._setUserAsOwner({ userId, organizationId }, () => {
        this.success({ status: "success", organizationId });
      });
    });
  }

}

