let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.GetEmployeeApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      employmentId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: {
        from: "employment",
        query: ({ employmentId }) => ({ id: employmentId }),
        select: "organizationId",
        errorCode: "EMPLOYEE_INVALID"
      },
      privileges: [
        "PRIV_VIEW_USERS"
      ]
    }];
  }

  _getEmployee({ employmentId }, cbfn) {
    this.database.employment.getEmploymentById({ employmentId }, (err, employee) => {
      if (!this._ensureDoc(err, employee, "EMPLOYEE_INVALID", "Employee does not exist")) return;
      return cbfn(employee);
    })
  }

  handle({ body }) {
    let { employmentId } =  body;
    this._getEmployee({ employmentId }, (employee) => {
      this.success({ employee });
    });
  }

}