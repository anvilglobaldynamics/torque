
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetOrganizationListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['organizationList']; }

  get requestSchema() {
    return Joi.object().keys({
    });
  }

  __getAggregatedOrganization({ employment, organization, settings }) {
    let { id, name, primaryBusinessAddress, phone, email, activeModuleCodeList } = organization;
    let { designation, role, companyProvidedId, isActive, privileges } = employment;
    let { receiptText1, receiptText2, monetaryUnit, decimalFormatPreset, logoImageId } = settings;
    return {
      id, name, primaryBusinessAddress, phone, email, activeModuleCodeList,
      employment: { designation, role, companyProvidedId, isActive, privileges },
      settings: { receiptText1, receiptText2, monetaryUnit, decimalFormatPreset, logoImageId }
    };
  }

  async __getOrganizationList({ userId }) {
    let organizationList = [];
    let employmentList = await this.database.employment.listActiveEmploymentsOfUser({ userId });
    for (let employment of employmentList) {
      let organization = await this.database.organization.findById({ id: employment.organizationId });
      let settings = await this.database.organizationSettings.findByOrganizationId({ organizationId: employment.organizationId });
      let aggregated = this.__getAggregatedOrganization({ employment, organization, settings });
      organizationList.push(aggregated);
    }
    return organizationList;
  }

  async handle({ userId }) {
    let organizationList = await this.__getOrganizationList({ userId });
    return { organizationList };
  }

}