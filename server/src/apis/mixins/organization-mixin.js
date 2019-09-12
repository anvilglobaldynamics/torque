const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

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

}