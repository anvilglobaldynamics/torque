let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetEmployeeApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      employmentId: Joi.number().max(999999999999999).required()
    });
  }

  _getEmployee({ employmentId }, cbfn) {
    this.database.employment.getEmploymentById({ employmentId }, (err, employee) => {
      if (err) return this.fail(err);
      if (employee === null) {
        err = new Error("Employee does not exist");
        err.code = "EMPLOYEE_INVALID"
        return this.fail(err);
      }
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