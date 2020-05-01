const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { OrganizationMixin } = require('./mixins/organization-mixin');

exports.EditOrganizationSettingsApi = class extends Api.mixin(OrganizationMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      monetaryUnit: Joi.string().min(1).max(3).required(),
      decimanFormatPreset: Joi.string().valid('XX,XX,XXX.XX', 'X,XXX,XXX.XX', 'X XXX XXX,XX', 'X.XXX.XXX,XX').required(),
      receiptText1: Joi.string().min(0).max(64).allow('').required(),
      receiptText2: Joi.string().min(0).max(64).allow('').required(),
      logoImageId: Joi.number().max(999999999999999).allow(null).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MODIFY_ORGANIZATION_SETTINGS"
      ]
    }];
  }

  async _updateOrganizationSettings({ organizationId, receiptText1, receiptText2, logoImageId, monetaryUnit, decimanFormatPreset }) {
    let res = await this.database.organizationSettings.setDetailsByOrganizationId({ organizationId }, { receiptText1, receiptText2, logoImageId, monetaryUnit, decimanFormatPreset });
    this.ensureUpdate(res, 'organizationSettings');
  }

  async handle({ body }) {
    let { organizationId, receiptText1, receiptText2, logoImageId, monetaryUnit, decimanFormatPreset } = body;

    await this._updateOrganizationSettings({ organizationId, receiptText1, receiptText2, logoImageId, monetaryUnit, decimanFormatPreset });

    await this._remotelyTerminateSessionOfUsersInOrganization({ organizationId });

    return { status: "success" };
  }

}