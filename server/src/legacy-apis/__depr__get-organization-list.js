
let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

const { organizationCommonMixin } = require('./mixins/organization-common');

// FIXME: Consider naming it get-aggregated-organization-list
exports.GetOrganizationListApi = class extends organizationCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
    });
  }

  handle({ body, userId }) {
    this._getOrganizationsThatEmployedUser({ userId }, (organizationList) => {
      this.success({ organizationList });
    }, (err => this.fail(err)));
  }

}

