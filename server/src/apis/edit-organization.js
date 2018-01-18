
let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.EditOrganizationApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().alphanum().min(11).max(14).required(),
      email: Joi.string().email().min(3).max(30).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privileges: [
        "PRIV_MODIFY_ORGANIZATION"
      ]
    }];
  }

  _updateOrganization({ organizationId, name, primaryBusinessAddress, phone, email }, cbfn) {
    this.database.organization.update({ organizationId }, { name, primaryBusinessAddress, phone, email }, (err, wasUpdated) => {
      if (!this._ensureUpdate(err, wasUpdated, "organization")) return;
      return cbfn();
    });
  }

  handle({ body, userId }) {
    let { organizationId, name, primaryBusinessAddress, phone, email } = body;
    this._updateOrganization({ organizationId, name, primaryBusinessAddress, phone, email }, _ => {
      this.success({ status: "success" });
    });
  }

}

