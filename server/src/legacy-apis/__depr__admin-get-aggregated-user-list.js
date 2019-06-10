let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
const { organizationCommonMixin } = require('./mixins/organization-common');

exports.AdminGetAggregatedUserListApi = class extends organizationCommonMixin(collectionCommonMixin(LegacyApi)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      userSearchString: Joi.string().min(0).max(64).allow('').required()
    });
  }

  _getAggregatedUserList({ userSearchString }, cbfn) {
    userSearchString = this.escapeRegExp(userSearchString.toLowerCase());
    let userSearchRegex = new RegExp(userSearchString, 'i');
    this.legacyDatabase.user.findByCommonFields({ userSearchRegex }, (err, userList) => {
      if (err) return this.fail(err);
      Promise.all(userList.map(user => new Promise((accept, reject) => {
        this._getOrganizationsThatEmployedUser({ userId: user.id }, (organizationList) => {
          user.organizationList = organizationList;
          return accept();
        }, (err => reject(err)));
      }))).then(() => {
        return cbfn(userList);
      }).catch(err => {
        return this.fail(err);
      });
    });
  }

  handle({ body }) {
    let { userSearchString } = body;
    this._getAggregatedUserList({ userSearchString }, (userList) => {
      this.success({ status: 'success', userList });
    });
  }

}