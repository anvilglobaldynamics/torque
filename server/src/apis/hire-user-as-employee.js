let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { userCommonMixin } = require('./mixins/user-common');

exports.HireUserAsEmployeeApi = class extends userCommonMixin(collectionCommonMixin(Api)) {

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

      privileges: Joi.object().required().keys({
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

        PRIV_VIEW_SALES_RETURN: Joi.boolean().required(),
        PRIV_MODIFY_SALES_RETURN: Joi.boolean().required(),

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

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privileges: [
        "PRIV_MODIFY_USERS"
      ]
    }];
  }

  // FIXME: Check if the user is employed in THIS organization. User can be employed in other organizations
  // without repercussions.
  _checkIfUserEmployed({ userId }, cbfn) {
    this.database.employment.getActiveEmploymentsOfUser({ userId }, (err, employmentList) => {
      if (err) return this.fail(err);
      if (employmentList.length > 0) {
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
    this._findUserById({ userId }, () => {
      this._checkIfUserEmployed({ userId }, () => {
        this._hireUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, (employmentId) => {
          this.success({ status: "success", employmentId });
        });
      });
    });
  }

}