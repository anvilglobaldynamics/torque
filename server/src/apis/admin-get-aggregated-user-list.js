
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.AdminGetAggregatedUserListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get autoPaginates() { return ['userList']; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      userSearchString: Joi.string().min(0).max(64).allow('').required()
    });
  }

  _getAggregatedOrganizationList({ organization, employment }) {
    let _organization = extract(organization, [
      'id', 'name', 'primaryBusinessAddress', 'phone', 'email', 'activeModuleCodeList'
    ]);
    let _employment = extract(employment, [
      'designation', 'role', 'companyProvidedId', 'isActive', 'privileges'
    ]);
    _organization.employment = _employment;
    return _organization;
  }

  async _getOrganizationsThatEmployedUser({ user }) {
    let employmentList = await this.database.employment.listActiveEmploymentsOfUser({ userId: user.id });
    let organizationList = [];
    let map = await this.crossmap({
      source: employmentList,
      sourceKeyFn: (employment) => employment.organizationId,
      target: 'organization'
    });
    map.forEach((organization, employment) => {
      organizationList.push(this._getAggregatedOrganizationList({ organization, employment }));
    });
    return organizationList;
  }

  async _getAggregatedUserList({ userSearchString }) {
    let escapedSearchString = this.escapeRegExp(userSearchString.toLowerCase());
    let userSearchRegex = new RegExp(escapedSearchString, 'i');
    let userList = await this.database.user.listByCommonFields({ userSearchRegex });

    await Promise.all(userList.map(async user => {
      user.organizationList = await this._getOrganizationsThatEmployedUser({ user });
      user.passwordHash = 'REDACTED';
    }));
    return userList;
  }

  async handle({ body }) {
    let { userSearchString } = body;
    let userList = await this._getAggregatedUserList({ userSearchString });
    return { status: 'success', userList };
  }

}