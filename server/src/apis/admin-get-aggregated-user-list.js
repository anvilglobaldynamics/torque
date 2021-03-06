
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
      originType: Joi.string().valid('any', 'real', 'test', 'unsure').required(),
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

  async _getAggregatedUserList({ userSearchString, originType }) {
    let escapedSearchString = this.escapeRegExp(userSearchString.toLowerCase());
    let userSearchRegex = new RegExp(escapedSearchString, 'i');
    let userList = await this.database.user.listByCommonFields({ userSearchRegex });

    if (originType !== 'any') {
      userList = userList.filter(user => user.originType === originType);
    }

    let totalUserCount = userList.length;

    // Cap userList at 18 to reduce server load.
    userList = userList.slice(0, 15);

    await Promise.all(userList.map(async user => {
      user.organizationList = await this._getOrganizationsThatEmployedUser({ user });
      user.passwordHash = 'REDACTED';
    }));

    await Promise.all(userList.map(async user => {
      let session = await this.database.session._findOne({ userId: user.id }, { sort: { id: -1 } });
      if (session){
        delete session['apiKey'];
      }
      user.session = session;
    }));

    return { userList, totalUserCount };
  }

  async handle({ body }) {
    let { userSearchString, originType } = body;
    let { userList, totalUserCount } = await this._getAggregatedUserList({ userSearchString, originType });
    return { status: 'success', userList, totalUserCount };
  }

}