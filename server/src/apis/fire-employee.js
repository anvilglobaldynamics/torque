let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { userCommonMixin } = require('./mixins/user-common');

exports.FireEmployeeApi = class extends userCommonMixin(collectionCommonMixin(Api)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      employmentId: Joi.number().max(999999999999999).required(),
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
        "PRIV_MODIFY_USERS"
      ]
    }];
  }

  _fireEmployee({ employmentId }, cbfn) {
    this.legacyDatabase.employment.getEmploymentById({ employmentId }, (err, employment) => {
      if (!this._ensureDoc(err, employment, "EMPLOYMENT_INVALID", "Unable to find employee to fire.")) return;
      this._expireUserWhenFired({ userId: employment.userId }, () => {
        this.legacyDatabase.employment.fire({ employmentId }, (err, wasUpdated) => {
          if (err) return this.fail(err);
          if (!wasUpdated) return this.fail(new Error(`Unable to find employee to fire.`));
          return cbfn();
        });
      });
    });
  }

  handle({ body }) {
    let { employmentId } = body;
    this._fireEmployee({ employmentId }, _ => {
      this.success({ status: "success" });
    });
  }

}