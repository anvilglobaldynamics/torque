let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

let { inventoryCommonMixin } = require('./mixins/inventory-common');

exports.AddOutletApi = class extends inventoryCommonMixin(LegacyApi) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      location: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_MODIFY_ALL_OUTLETS"
      ]
    }];
  }

  _createOutlet({ name, organizationId, physicalAddress, phone, contactPersonName, location }, cbfn) {
    let outlet = {
      name, organizationId, physicalAddress, phone, contactPersonName, location
    }
    this.legacyDatabase.outlet.create(outlet, (err, outletId) => {
      if (err) return this.fail(err);
      return cbfn(outletId);
    });
  }

  _checkOrganizationPackageOutletLimit({ organizationId, aPackage }, cbfn) {
    this.legacyDatabase.outlet.listByOrganizationId({ organizationId }, (err, outletList) => {
      if (err) return this.fail(err);
      if (outletList.length == aPackage.limits.maximumOutlets) {
        err = new Error("Organization activated package max outlet limit reached");
        err.code = "ORGANIZATION_PACKAGE_MAX_OUTLET_LIMIT_REACHED";
        return this.fail(err);
      }
      return cbfn();
    });
  }

  handle({ body }) {
    let { name, organizationId, physicalAddress, phone, contactPersonName, location } = body;
    let { aPackage } = this.interimData;
    this._checkOrganizationPackageOutletLimit({ organizationId, aPackage }, () => {
      this._createOutlet({ name, organizationId, physicalAddress, phone, contactPersonName, location }, (outletId) => {
        this._createStandardInventories({ inventoryContainerId: outletId, inventoryContainerType: "outlet", organizationId }, () => {
          this.success({ status: "success", outletId });
        });
      });
    });
  }

}