let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetEmployeeListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  _getEmployeeList(organizationId, cbfn) {
    this.database.employment.listByOrganizationId({ organizationId }, (err, employeeList) => {
      if (err) return this.fail(err);
      cbfn(employeeList);
    })
  }

  handle({ body }) {
    let { organizationId } =  body;
    this._getEmployeeList(organizationId, (employeeList) => {
      this.success({ employeeList });
    });
  }

}