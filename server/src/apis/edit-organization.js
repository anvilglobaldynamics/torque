const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { OrganizationMixin } = require('./mixins/organization-mixin');

exports.EditOrganizationApi = class extends Api.mixin(OrganizationMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      email: Joi.string().email().min(3).max(30).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        select: "organizationId",
        errorCode: "OUTLET_INVALID"
      },
      privilegeList: [
        "PRIV_MODIFY_ORGANIZATION"
      ]
    }];
  }

  async _updateOrganization({ organizationId, name, primaryBusinessAddress, phone, email }) {
    let res = await this.database.organization.setDetails({ id: organizationId }, { name, primaryBusinessAddress, phone, email });
    this.ensureUpdate('organization', res);
  }

  async handle({ body }) {
    let { organizationId, name, primaryBusinessAddress, phone, email } = body;

    await this._updateOrganization({ organizationId, name, primaryBusinessAddress, phone, email });
    return { status: "success" };
  }

}

