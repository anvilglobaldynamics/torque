let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { userCommonMixin } = require('./mixins/user-common');
let { phoneVerificationRequestMixin } = require('./mixins/phone-verification-request-mixin');

exports.AddNewEmployeeApi = class extends phoneVerificationRequestMixin(userCommonMixin(LegacyApi)) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      password: Joi.string().min(8).max(30).required(),

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
        PRIV_MANAGE_CUSTOMER_WALLET_BALANCE: Joi.boolean().required(),

        PRIV_VIEW_VENDOR: Joi.boolean().required(),
        PRIV_MODIFY_VENDOR: Joi.boolean().required(),

        PRIV_VIEW_REPORTS: Joi.boolean().required(),
        
        MODIFY_ORGANIZATION_SETTINGS: Joi.boolean().required()
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

  _hireUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, cbfn) {
    this.legacyDatabase.employment.hireExistingUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, (err, employmentId) => {
      return cbfn(employmentId);
    })
  }

  _checkOrganizationPackageEmployeeLimit({ organizationId, aPackage }, cbfn) {
    this.legacyDatabase.employment.listByOrganizationId({ organizationId }, (err, employmentList) => {
      if (err) return this.fail(err);
      if (employmentList.length == aPackage.limits.maximumEmployees) {
        err = new Error(this.verses.packageLimitCommon.activePackageLimitReached);
        err.code = "ORGANIZATION_PACKAGE_LIMIT_REACHED";
        return this.fail(err);
      }
      return cbfn();
    });
  }

  handle({ body }) {
    let { fullName, phone, password, organizationId, role, designation, companyProvidedId, privileges } = body;
    let { aPackage } = this.interimData;
    this._checkOrganizationPackageEmployeeLimit({ organizationId, aPackage }, () => {
      this._createUser({ fullName, phone, password, agreedToTocDatetimeStamp: null }, (userId) => {
        this._hireUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, (employmentId) => {
          this._createPhoneVerificationRequest({ phone, userId }, (verificationLink) => {
            this._sendPhoneVerificationSms({ phone, verificationLink });
            this.success({ status: "success", userId, employmentId });
          });
        });
      });
    });
  }

}