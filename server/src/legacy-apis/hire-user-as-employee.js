let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');
let { userCommonMixin } = require('./mixins/user-common');

exports.HireUserAsEmployeeApi = class extends userCommonMixin(collectionCommonMixin(LegacyApi)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      userId: Joi.number().max(999999999999999).required(),

      organizationId: Joi.number().max(999999999999999).required(),
      role: Joi.string().max(64).required(),
      designation: Joi.string().max(64).required(),
      companyProvidedId: Joi.string().allow('').max(64).required(),

      privileges: Joi.object().required().keys({
        PRIV_VIEW_USERS: Joi.boolean().required(),
        PRIV_MODIFY_USERS: Joi.boolean().required(),

        PRIV_ACCESS_POS: Joi.boolean().required(),
        PRIV_VIEW_SALES: Joi.boolean().required(),
        PRIV_MODIFY_SALES: Joi.boolean().required(),
        PRIV_ALLOW_FLAT_DISCOUNT: Joi.boolean().required(),

        PRIV_VIEW_ALL_SERVICE_MEMBERSHIPS: Joi.boolean().required(),
        PRIV_MODIFY_ALL_SERVICE_MEMBERSHIPS: Joi.boolean().required(),

        PRIV_VIEW_SALES_RETURN: Joi.boolean().required(),
        PRIV_MODIFY_SALES_RETURN: Joi.boolean().required(),

        PRIV_VIEW_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_VIEW_ALL_SERVICES: Joi.boolean().required(),
        PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS: Joi.boolean().required(),
        PRIV_MODIFY_ALL_SERVICE_BLUEPRINTS: Joi.boolean().required(),
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
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MODIFY_USERS"
      ]
    }];
  }

  _checkIfUserEmployed({ userId, organizationId }, cbfn) {
    this.legacyDatabase.employment.getActiveEmploymentsOfUser({ userId }, (err, employmentList) => {
      if (err) return this.fail(err);
      employmentList = employmentList.filter(employment => employment.organizationId === organizationId);
      if (employmentList.length > 0) {
        err = new Error("User is already employed");
        err.code = "ALREADY_EMPLOYED"
        return this.fail(err);
      }
      return cbfn();
    })
  }

  _hireUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, cbfn) {
    this.legacyDatabase.employment.hireExistingUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, (err, employmentId) => {
      return cbfn(employmentId);
    })
  }

  _checkOrganizationPackageEmployeeLimit({ organizationId, aPackage }, cbfn) {
    this.legacyDatabase.employment.listByOrganizationId({ organizationId }, (err, employmentList) => {
      if (err) return this.fail(err);
      if (employmentList.length == aPackage.limits.maximumEmployees) {
        err = new Error("Organization activated package max employee limit reached");
        err.code = "ORGANIZATION_PACKAGE_MAX_EMPLOYEE_LIMIT_REACHED";
        return this.fail(err);
      }
      return cbfn();
    });
  }

  handle({ body }) {
    let { userId, organizationId, role, designation, companyProvidedId, privileges, aPackage } = body;
    this._checkOrganizationPackageEmployeeLimit({ organizationId, aPackage }, () => {
      this._findUserById({ userId }, (user) => {
        this._checkIfUserEmployed({ userId, organizationId }, () => {
          this._hireUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, (employmentId) => {
            this.success({ status: "success", employmentId });
          });
        });
      });
    });
  }

}