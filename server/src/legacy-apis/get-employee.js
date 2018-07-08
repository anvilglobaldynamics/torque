let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { userCommonMixin } = require('./mixins/user-common');

exports.GetEmployeeApi = class extends collectionCommonMixin(userCommonMixin(LegacyApi)) {

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
    this.legacyDatabase.employment.getEmploymentById({ employmentId }, (err, employee) => {
      if (!this._ensureDoc(err, employee, "EMPLOYEE_INVALID", "Employee does not exist")) return;
      return cbfn(employee);
    })
  }

  _insertUserDetailsInEmployee({ employee, user }, cbfn) {
    let { fullName, phone, email, nid, physicalAddress, emergencyContact, bloodGroup } = user;
    employee.userDetails = { fullName, phone, email, nid, physicalAddress, emergencyContact, bloodGroup };

    cbfn(employee);
  }

  handle({ body }) {
    let { employmentId } =  body;
    this._getEmployee({ employmentId }, (employee) => {
      this._findUserById({ userId: employee.userId }, (user) => {
        this._insertUserDetailsInEmployee({ employee, user }, (employee) => {
          this.success({ employee });
        });
      });
    });
  }

}