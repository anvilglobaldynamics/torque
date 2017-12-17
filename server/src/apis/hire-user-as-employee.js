let { Api } = require('./../api-base');
let Joi = require('joi');

exports.HireUserAsEmployeeApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      userId: Joi.number().max(999999999999999).required(),

      organizationId: Joi.number().max(999999999999999).required(),
      role: Joi.string().max(1024).required(),
      designation: Joi.string().max(1024).required(),
      companyProvidedId: Joi.string().alphanum().allow('').max(1024).required(),

      privileges: Joi.object().keys({
        PRIV_VIEW_USERS: Joi.boolean().required(),
        PRIV_MODIFY_USERS: Joi.boolean().required(),
        PRIV_ADD_USER: Joi.boolean().required(),
        PRIV_MAKE_USER_AN_OWNER: Joi.boolean().required(),
        PRIV_MODIFY_USER_PRIVILEGES: Joi.boolean().required(),

        PRIV_ACCESS_POS: Joi.boolean().required(),
        PRIV_VIEW_SALES: Joi.boolean().required(),
        PRIV_MODIFY_SALES: Joi.boolean().required(),
        PRIV_ALLOW_FLAT_DISCOUNT: Joi.boolean().required(),
        PRIV_ALLOW_INDIVIDUAL_DISCOUNT: Joi.boolean().required(),
        PRIV_ALLOW_FOC: Joi.boolean().required(),

        PRIV_VIEW_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_MODIFY_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_TRANSFER_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_REPORT_DAMAGES_IN_ALL_INVENTORIES: Joi.boolean().required(),

        PRIV_VIEW_ALL_OUTLETS: Joi.boolean().required(),
        PRIV_MODIFY_ALL_OUTLETS: Joi.boolean().required(),

        PRIV_VIEW_ALL_WAREHOUSES: Joi.boolean().required(),
        PRIV_MODIFY_ALL_WAREHOUSES: Joi.boolean().required(),

        PRIV_VIEW_ORGANIZATION_STATISTICS: Joi.boolean().required(),
        PRIV_MODIFY_ORGANIZATION: Joi.boolean().required(),

        PRIV_VIEW_CUSTOMER: Joi.boolean().required(),
        PRIV_ADD_CUSTOMER_DURING_SALES: Joi.boolean().required(),
        PRIV_MODIFY_CUSTOMER: Joi.boolean().required(),
        PRIV_MANAGE_CUSTOMER_DEBT: Joi.boolean().required()
      })
    });
  }

  _findUser({ userId }, cbfn) {
    this.database.user.getById(userId, (err, user) => {
      if (err) return this.fail(err);
      if (user === null) {
        err = new Error("Invalid User could not be found");
        err.code = "USER_INVALID"
        return this.fail(err);
      }
      return cbfn();
    })
  }

  _checkIfUserEmployed({ userId }, cbfn) {
    this.database.employment.getEmploymentsOfEmployee(userId, (err, employmentList) => {
      if (err) return this.fail(err);
      if (employmentList.length > null) {
        err = new Error("User is already employed");
        err.code = "ALREADY_EMPLOYED"
        return this.fail(err);
      }
      return cbfn();
    })
  }

  _hireUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, cbfn) {
    this.database.employment.hireExistingUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, (err, employmentId) => {
      return cbfn(employmentId);
    })
  }

  handle({ body }) {
    let { userId, organizationId, role, designation, companyProvidedId, privileges } = body;
    this._findUser({ userId }, () => {
      this._checkIfUserEmployed({ userId }, () => {
        this._hireUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, (employmentId) => {
          this.success({ status: "success", employmentId: employmentId });
        });
      });
    });
  }

}

