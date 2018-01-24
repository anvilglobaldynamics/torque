
let { Api } = require('./../api-base');
let Joi = require('joi');

// FIXME: Consider naming it get-aggregated-organization-list
exports.GetOrganizationListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
    });
  }

  __getAggregatedOrganizationList({ employmentList, organizationList }) {
    return organizationList.map((organization) => {
      let employment = employmentList.find((employment) => employment.organizationId === organization.id);
      let { id, name, primaryBusinessAddress, phone, email } = organization;
      let { designation, role, companyProvidedId, isActive, privileges } = employment;
      return {
        id, name, primaryBusinessAddress, phone, email,
        employment: { designation, role, companyProvidedId, isActive, privileges }
      };
    });
  }

  _getOrganizationsThatEmployedUser({ userId }, cbfn) {
    this.database.employment.getEmploymentsOfUser({ userId }, (err, employmentList) => {
      if (err) return this.fail(err);
      let list = employmentList.map((employment) => employment.organizationId);
      this.database.organization.listByIdList({ idList: list }, (err, organizationList) => {
        if (err) return this.fail(err);
        let list = this.__getAggregatedOrganizationList({ employmentList, organizationList });
        cbfn(list);
      });
    });
  }

  handle({ body, userId }) {
    this._getOrganizationsThatEmployedUser({ userId }, (organizationList) => {
      this.success({ organizationList });
    });
  }

}

