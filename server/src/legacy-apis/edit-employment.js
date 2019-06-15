let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { userCommonMixin } = require('./mixins/user-common');

exports.EditEmploymentApi = class extends userCommonMixin(collectionCommonMixin(LegacyApi)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      employmentId: Joi.number().max(999999999999999).required(),

      isActive: Joi.boolean().required(),

      role: Joi.string().max(64).required(),
      designation: Joi.string().max(64).required(),
      companyProvidedId: Joi.string().allow('').max(64).required(),

      privileges: Joi.object().keys({
        PRIV_VIEW_USERS: Joi.boolean().required(),
        PRIV_MODIFY_USERS: Joi.boolean().required(),

        PRIV_ACCESS_POS: Joi.boolean().required(),
        PRIV_VIEW_SALES: Joi.boolean().required(),
        PRIV_MODIFY_SALES: Joi.boolean().required(),
        PRIV_ALLOW_FLEXIBLE_PRICE: Joi.boolean().required(),
        PRIV_VIEW_PURCHASE_PRICE: Joi.boolean().required(),

        PRIV_MODIFY_DISCOUNT_PRESETS: Joi.boolean().required(),

        PRIV_VIEW_ALL_SERVICE_MEMBERSHIPS: Joi.boolean().required(),
        PRIV_MODIFY_ALL_SERVICE_MEMBERSHIPS: Joi.boolean().required(),

        PRIV_VIEW_SALES_RETURN: Joi.boolean().required(),
        PRIV_MODIFY_SALES_RETURN: Joi.boolean().required(),

        PRIV_VIEW_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_VIEW_ALL_SERVICES: Joi.boolean().required(),
        PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS: Joi.boolean().required(),
        PRIV_MODIFY_ALL_SERVICE_BLUEPRINTS: Joi.boolean().required(),
        PRIV_VIEW_ALL_SERVICE_BLUEPRINTS: Joi.boolean().required(),
        PRIV_VIEW_ALL_PRODUCT_BLUEPRINTS: Joi.boolean().required(),
        PRIV_TRANSFER_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_ADD_PRODUCTS_TO_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_MODIFY_ALL_SERVICES_AVAILABILITY_IN_ALL_OUTLETS: Joi.boolean().required(),

        PRIV_VIEW_ALL_OUTLETS: Joi.boolean().required(),
        PRIV_MODIFY_ALL_OUTLETS: Joi.boolean().required(),

        PRIV_VIEW_ALL_WAREHOUSES: Joi.boolean().required(),
        PRIV_MODIFY_ALL_WAREHOUSES: Joi.boolean().required(),

        PRIV_VIEW_ORGANIZATION_STATISTICS: Joi.boolean().required(),
        PRIV_MODIFY_ORGANIZATION: Joi.boolean().required(),

        PRIV_VIEW_CUSTOMER: Joi.boolean().required(),
        PRIV_MODIFY_CUSTOMER: Joi.boolean().required(),
        PRIV_MANAGE_CUSTOMER_WALLET_BALANCE: Joi.boolean().required()
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
      privilegeList: [
        "PRIV_MODIFY_USERS"
      ]
    }];
  }

  _updateEmployment({ employmentId, isActive, role, designation, companyProvidedId, privileges }, cbfn) {
    this.legacyDatabase.employment.update({ employmentId }, { isActive, role, designation, companyProvidedId, privileges }, (err, wasUpdated) => {
      if (!this._ensureUpdate(err, wasUpdated, "outlet")) return;
      this.legacyDatabase.employment.getEmploymentById({ employmentId }, (err, employment) => {
        this._expireUserSessionRemotely({ userId: employment.userId }, () => {
          return cbfn();
        });
      });
    });
  }

  handle({ body }) {
    let { employmentId, isActive, role, designation, companyProvidedId, privileges } = body;
    this._updateEmployment({ employmentId, isActive, role, designation, companyProvidedId, privileges }, _ => {
      this.success({ status: "success" });
    });
  }

}