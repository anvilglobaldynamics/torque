
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

  __getAggregatedOrganization({ employment, organization }) {
    let { id, name, primaryBusinessAddress, phone, email, activeModuleCodeList } = organization;
    let { designation, role, companyProvidedId, isActive, privileges } = employment;
    return {
      id, name, primaryBusinessAddress, phone, email, activeModuleCodeList,
      employment: { designation, role, companyProvidedId, isActive, privileges }
    };
  }

  async __getOrganizationList({ userId }) {
    let organizationList = [];
    let employmentList = await this.database.employment.listActiveEmploymentsOfUser({ userId });
    for (let employment of employmentList) {
      let organization = await this.database.organization.findById({ id: employment.organizationId });
      let org = this.__getAggregatedOrganization({employment, organization});
      organizationList.push(org);
    }
    return organizationList;
  }

  async handle({ userId }) {
    let organizationList = await this.__getOrganizationList({ userId });
    return { organizationList };
  }

}