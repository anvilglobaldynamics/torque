let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.EditEmploymentApi = class extends collectionCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      employmentId: Joi.number().max(999999999999999).required(),

      isActive: Joi.boolean().required(),

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
      organizationBy: {
        from: "employment",
        query: ({ employmentId }) => ({ id: employmentId }),
        select: "organizationId",
        errorCode: "EMPLOYEE_INVALID"
      },
      privileges: [
        "PRIV_MODIFY_USERS",
        "PRIV_MODIFY_USER_PRIVILEGES"
      ]
    }];
  }

  _updateEmployment({ employmentId, isActive, role, designation, companyProvidedId, privileges }, cbfn) {
    this.legacyDatabase.employment.update({ employmentId }, { isActive, role, designation, companyProvidedId, privileges }, (err, wasUpdated) => {
      if (!this._ensureUpdate(err, wasUpdated, "outlet")) return;
      return cbfn();
    });
  }

  handle({ body }) {
    let { employmentId, isActive, role, designation, companyProvidedId, privileges } = body;
    this._updateEmployment({ employmentId, isActive, role, designation, companyProvidedId, privileges }, _ => {
      this.success({ status: "success" });
    });
  }

}