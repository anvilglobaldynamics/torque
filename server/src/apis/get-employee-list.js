const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetEmployeeListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['employeeList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      searchString: Joi.string().min(0).max(64).allow('').optional()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_USERS"
      ]
    }];
  }

  async _getUserList({ employeeList }) {
    let userIdList = employeeList.map(employee => employee.userId);
    let userList = await this.database.user.listByIdList({ idList: userIdList });
    return userList;
  }

  _insertUserInfoInEmployeeList({ employeeList, userList }) {
    employeeList.forEach(employee => {
      let matchingUser = userList.find(user => user.id === employee.userId);

      let { fullName, phone, email, nid, physicalAddress, emergencyContact, bloodGroup } = matchingUser;
      employee.userDetails = { fullName, phone, email, nid, physicalAddress, emergencyContact, bloodGroup };
    });

    return employeeList;
  }

  _searchCombineEmployeeList({ employeeList, searchString }) {
    employeeList = employeeList.filter(employee => {
      searchString = this.escapeRegExp(searchString.toLowerCase());
      let regex = new RegExp(searchString, 'i');
      return regex.test(employee.userDetails.fullName);
    });

    return employeeList;
  }

  async handle({ body }) {
    let { organizationId, searchString } =  body;

    let employeeList = await this.database.employment.listByOrganizationId({ organizationId });
    let userList = await this._getUserList({ employeeList });
    employeeList = this._insertUserInfoInEmployeeList({ employeeList, userList });

    if (searchString) {
      employeeList = this._searchCombineEmployeeList({ employeeList, searchString });
    }

    return { employeeList };
  }

}