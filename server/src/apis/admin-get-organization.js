
const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');

exports.AdminGetOrganizationApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get authenticationLevel() { return 'admin'; }

  get requestSchema() {
    return Joi.object().keys({
      apiKey: Joi.string().length(64).required(),
      organizationId: Joi.number().max(999999999999999).required()
    });
  }


  async _getUserList({ employeeList }) {
    let userIdList = employeeList.map(employee => employee.userId);
    let userList = await this.database.user.listByIdList({ idList: userIdList });
    return userList;
  }

  _insertUserInfoInEmployeeList({ employeeList, userList }) {
    employeeList.forEach(employee => {
      let matchingUser = userList.find(user => user.id === employee.userId);

      let { fullName, phone, email, nid, physicalAddress, emergencyContact, bloodGroup, id } = matchingUser;
      employee.userDetails = { fullName, phone, email, nid, physicalAddress, emergencyContact, bloodGroup, id };
    });

    return employeeList;
  }

  async handle({ body }) {
    let organization = await this.database.organization.findById({ id: body.organizationId });
    throwOnFalsy(organization, "ORGANIZATION_INVALID", "organizationBy function did not return valid organization.");

    let organizationId = organization.id;

    let outletList = await this.database.outlet._find({ organizationId });

    let warehouseList = await this.database.warehouse._find({ organizationId });

    let employeeList = await this.database.employment.listByOrganizationId({ organizationId });
    let userList = await this._getUserList({ employeeList });
    employeeList = this._insertUserInfoInEmployeeList({ employeeList, userList });

    return { organization, outletList, warehouseList, employeeList };
  }

}