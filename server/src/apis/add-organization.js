
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.AddOrganizationApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      email: Joi.string().email().min(3).max(30).allow('').required(),
    });
  }

  async _createOrganization({ name, primaryBusinessAddress, phone, email }) {
    return await this.database.organization.create({ name, primaryBusinessAddress, phone, email });
  }

  async _setUserAsOwner({ userId, organizationId }) {
    let res = await this.database.employment.addOwner({ userId, organizationId });
    throwOnFalsy(res, "UNABLE_TO_SET_EMPLOYMNET", "Unable to set employment for unknown reasons");
  }

  async _setTrialPackage({ organizationId }) {
    const packageCode = "T01";
    let aPackage = await this.database.fixture.findPackageByCode({ packageCode });
    throwOnFalsy(aPackage, "DEV_ERROR", "package is missing");
    let packageActivationId = await this.database.packageActivation.create({ packageCode, organizationId });
    let res = await this.database.organization.setPackageActivationId({ id: organizationId }, { packageActivationId });
    throwOnFalsy(res, "DEV_ERROR", "Unable to set package");
  }

  async handle({ body, userId }) {
    let { name, primaryBusinessAddress, phone, email } = body;
    let organizationId = await this._createOrganization({ name, primaryBusinessAddress, phone, email });
    await this._setUserAsOwner({ userId, organizationId });
    await this._setTrialPackage({ organizationId });
    return { status: "success", organizationId };
  }

}