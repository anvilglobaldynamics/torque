exports.OrganizationMixin = (SuperApiClass) => class extends SuperApiClass {

  async _findOrganizationByEmailOrPhone({ emailOrPhone }) {
    let organization = await this.database.organization.findByEmailOrPhone({ emailOrPhone });
    return organization;
  }

}