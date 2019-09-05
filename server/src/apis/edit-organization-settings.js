const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.EditOrganizationSettingsApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      receiptText1: Joi.string().min(0).max(128).allow('').required(),
      receiptText2: Joi.string().min(0).max(128).allow('').required(),
      logoImageId: Joi.number().max(999999999999999).allow(null).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        // "PRIV_MODIFY_ALL_OUTLETS"
      ]
    }];
  }

  async _updateOrganizationSettings({ organizationId, receiptText1, receiptText2, logoImageId }) {
    let res = await this.database.organizationSettings.setDetailsByOrganizationId({ organizationId }, { receiptText1, receiptText2, logoImageId });
    this.ensureUpdate(res, 'organizationSettings');
  }

  async handle({ body }) {
    let {  organizationId, receiptText1, receiptText2, logoImageId  } = body;

    await this._updateOrganizationSettings({  organizationId, receiptText1, receiptText2, logoImageId  });
    return { status: "success" };
  }

}