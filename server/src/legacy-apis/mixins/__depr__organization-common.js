
exports.organizationCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  __getAggregatedOrganizationList({ employmentList, organizationList }) {
    return organizationList.map((organization) => {
      let employment = employmentList.find((employment) => employment.organizationId === organization.id);
      let { id, name, primaryBusinessAddress, phone, email, activeModuleCodeList } = organization;
      let { designation, role, companyProvidedId, isActive, privileges } = employment;
      return {
        id, name, primaryBusinessAddress, phone, email, activeModuleCodeList,
        employment: { designation, role, companyProvidedId, isActive, privileges }
      };
    });
  }

  _getOrganizationsThatEmployedUser({ userId }, cbfn, errorCallback) {
    this.legacyDatabase.employment.getActiveEmploymentsOfUser({ userId }, (err, employmentList) => {
      if (err) return errorCallback(err);
      let list = employmentList.map((employment) => employment.organizationId);
      this.legacyDatabase.organization.listByIdList({ idList: list }, (err, organizationList) => {
        if (err) return errorCallback(err);
        let list = this.__getAggregatedOrganizationList({ employmentList, organizationList });
        cbfn(list);
      });
    });
  }

}



