
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const MAX_ORGANIZATION_LIMIT = 1000;

exports.AddOrganizationApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      email: Joi.string().email().min(3).max(30).allow('').required(),
      activeModuleCodeList: Joi.array().items(
        Joi.string().required()
      ).optional().default(['MOD_PRODUCT', 'MOD_SERVICE'])
    });
  }

  async _createOrganization({ name, primaryBusinessAddress, phone, email, userId, activeModuleCodeList }) {
    return await this.database.organization.create({ name, primaryBusinessAddress, phone, email, userId, activeModuleCodeList });
  }

  async _setUserAsOwner({ userId, organizationId }) {
    let res = await this.database.employment.addOwner({ userId, organizationId });
    throwOnFalsy(res, "UNABLE_TO_SET_EMPLOYMNET", "Unable to set employment for unknown reasons");
  }

  async _setTrialPackage({ organizationId }) {
    const packageCode = "R-T01";
    let aPackage = await this.database.fixture.findPackageByCode({ packageCode });
    throwOnFalsy(aPackage, "DEV_ERROR", "package is missing");
    let packageActivationId = await this.database.packageActivation.create({ packageCode, organizationId, createdByAdminName: "system", paymentReference: "SERVER_ADD_ORGANIZATION_API" });
    let res = await this.database.organization.setPackageActivationId({ id: organizationId }, { packageActivationId });
    throwOnFalsy(res, "DEV_ERROR", "Unable to set package");
  }

  async _checkIfMaxOrganizationLimitReached({ userId }) {
    let organizationList = await this.database.organization.listByCreatedByUserId({ userId });
    if (organizationList) {
      if (organizationList.length >= MAX_ORGANIZATION_LIMIT) {
        throw new CodedError("MAX_ORGANIZATION_LIMIT_REACHED", "Maximum organization limit has been reached.");
      }
    }
  }

  async _validatedactiveModuleCodeList({ activeModuleCodeList }) {
    let moduleList = await this.database.fixture.getModuleList();
    activeModuleCodeList.forEach(activeModuleCode => {
      let aModule = moduleList.find(aModule => aModule.code === activeModuleCode);
      throwOnFalsy(aModule, "MODULE_INVALID", "Selected module is invalid."); // TRANSLATE
    })
  }

  async _addModuleActivation({ organizationId, activeModuleCodeList }) {
    for (let moduleCode of activeModuleCodeList) {
      let createdByAdminName = 'system';
      let paymentReference = 'SERVER_ADD_ORGANIZATION_API';
      await this.database.moduleActivation.create({ moduleCode, organizationId, createdByAdminName, paymentReference });
    }
  }

  async handle({ body, userId }) {
    let { name, primaryBusinessAddress, phone, email, activeModuleCodeList } = body;
    await this._checkIfMaxOrganizationLimitReached({ userId });

    await this._validatedactiveModuleCodeList({ activeModuleCodeList });

    let organizationId = await this._createOrganization({ name, primaryBusinessAddress, phone, email, userId, activeModuleCodeList });
    await this._setUserAsOwner({ userId, organizationId });
    await this._setTrialPackage({ organizationId });
    await this._addModuleActivation({ organizationId, activeModuleCodeList });

    return { status: "success", organizationId };
  }

}