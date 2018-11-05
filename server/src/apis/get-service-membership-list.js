
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetServiceMembershipListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['serviceMembershipList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      serviceBlueprintId: Joi.number().max(999999999999999).allow(null).required(),
      outletId: Joi.number().max(999999999999999).allow(null).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),

      shouldFilterByServiceBlueprint: Joi.boolean().required(),
      shouldFilterByOutlet: Joi.boolean().required(),
      shouldFilterByCustomer: Joi.boolean().required(),

      fromDate: Joi.number().max(999999999999999).required(),
      toDate: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_ALL_SERVICE_MEMBERSHIPS"
      ],
      moduleList: [
        "MOD_SERVICE",
      ]
    }];
  }

  _getExtendedToDate(toDate) {
    toDate = new Date(toDate);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate = toDate.getTime();
    return toDate;
  }

  async _verifyOutletIfNeeded({ outletId, shouldFilterByOutlet }) {
    if (shouldFilterByOutlet) {
      let doc = await this.database.outlet.findById({ id: outletId });
      throwOnFalsy(doc, "OUTLET_INVALID", "Outlet not found.");
    }
  }

  async _verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer }) {
    if (shouldFilterByCustomer) {
      let doc = await this.database.customer.findById({ id: customerId });
      throwOnFalsy(doc, "CUSTOMER_INVALID", "Customer not found.");
    }
  }

  async _verifyServiceBlueprintIfNeeded({ serviceBlueprintId, shouldFilterByServiceBlueprint }) {
    if (shouldFilterByServiceBlueprint) {
      let doc = await this.database.serviceBlueprint.findById({ id: serviceBlueprintId });
      throwOnFalsy(doc, "SERVICE_BLUEPRINT_INVALID", "Service blueprint not found.");
    }
  }

  async handle({ body }) {
    let { serviceBlueprintId, outletId, customerId, shouldFilterByServiceBlueprint, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate } = body;

    toDate = this._getExtendedToDate(toDate);

    await this._verifyOutletIfNeeded({ outletId, shouldFilterByOutlet });
    await this._verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer });
    await this._verifyServiceBlueprintIfNeeded({ serviceBlueprintId, shouldFilterByServiceBlueprint });
    
    return { serviceMembershipList: [] };
  }

}