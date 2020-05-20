const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

const MAX_ORGANIZATION_LIMIT = 1000;

/** @param {typeof Api} SuperApiClass */
exports.OrganizationMixin = (SuperApiClass) => class extends SuperApiClass {

  async _findOrganizationByEmailOrPhone({ emailOrPhone }) {
    let organization = await this.database.organization.findByEmailOrPhone({ emailOrPhone });
    return organization;
  }

  async _remotelyTerminateSessionOfUsersInOrganization({ organizationId }) {
    let employmentList = await this.database.employment.listByOrganizationId({ organizationId });
    for (let employment of employmentList) {
      await this.database.session.expireByUserId({ userId: employment.userId });
    }
  }

  // Organization Creation - Start

  async _createOrganization({ name, primaryBusinessAddress, phone, email, userId, countryCode, activeModuleCodeList }) {
    return await this.database.organization.create({ originApp: this.clientApplication, name, primaryBusinessAddress, phone, email, userId, countryCode, activeModuleCodeList });
  }

  async _createOrganizationSettings({ organizationId }) {
    let receiptText1 = '';
    let receiptText2 = '';

    // TODO: Collect during signup
    let monetaryUnit = 'BDT';
    let decimalFormatPreset = 'XX,XX,XXX.XX';

    let logoImageId = null;
    return await this.database.organizationSettings.create({ organizationId, receiptText1, receiptText2, logoImageId, monetaryUnit, decimalFormatPreset });
  }

  async _setUserAsOwner({ userId, organizationId }) {
    let employmentId = await this.database.employment.addOwner({ userId, organizationId });
    throwOnFalsy(employmentId, "UNABLE_TO_SET_EMPLOYMNET", "Unable to set employment for unknown reasons");
    return employmentId;
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

  async createDefaultPaymentMethods({ organizationId }) {
    await this.database.paymentMethod.create({
      organizationId,
      name: 'Cash', 
      monetaryAccountId: (await this.getAccountByCodeName({ organizationId, codeName: 'CASH' })).id
    });

    await this.database.paymentMethod.create({
      organizationId,
      name: 'Card', 
      monetaryAccountId: (await this.getAccountByCodeName({ organizationId, codeName: 'BANK' })).id
    });

    await this.database.paymentMethod.create({
      organizationId,
      name: 'Digital', 
      monetaryAccountId: (await this.getAccountByCodeName({ organizationId, codeName: 'BANK' })).id
    });

    await this.database.paymentMethod.create({
      organizationId,
      name: 'Cheque', 
      monetaryAccountId: (await this.getAccountByCodeName({ organizationId, codeName: 'BANK' })).id
    });
  }

  // Organization Creation - End

}