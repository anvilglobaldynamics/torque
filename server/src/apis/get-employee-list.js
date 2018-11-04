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
      organizationId: Joi.number().max(999999999999999).required()
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

  _getEmployeeList({ organizationId }, cbfn) {
    this.legacyDatabase.employment.listByOrganizationId({ organizationId }, (err, employeeList) => {
      if (err) return this.fail(err);
      cbfn(employeeList);
    })
  }

  _getUserList({ employeeList }, cbfn) {
    let userIdList = employeeList.map(employee => employee.userId);
    this.legacyDatabase.user.listByIdList({ idList: userIdList }, (err, userList) => {
      if (err) return this.fail(err);
      cbfn(userList);
    })
  }

  _insertUserInfoInEmployeeList({ employeeList, userList }, cbfn) {
    employeeList.forEach(employee => {
      let matchingUser = userList.find(user => user.id === employee.userId);

      let { fullName, phone, email, nid, physicalAddress, emergencyContact, bloodGroup } = matchingUser;
      employee.userDetails = { fullName, phone, email, nid, physicalAddress, emergencyContact, bloodGroup };
    });

    cbfn(employeeList);
  }

  async handle({ body }) {
    let { organizationId } =  body;

    // this._getEmployeeList({ organizationId }, (employeeList) => {
    //   this._getUserList({ employeeList }, (userList) => {
    //     this._insertUserInfoInEmployeeList({ employeeList, userList }, (employeeList) => {
    //       this.success({ employeeList });
    //     });
    //   });
    // });

    return { employeeList: [] };
  }

}