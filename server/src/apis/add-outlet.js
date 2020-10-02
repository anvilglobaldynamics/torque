const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');
const { extract } = require('../utils/extract');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { OutletMixin } = require('./mixins/outlet-mixin');

exports.AddOutletApi = class extends Api.mixin(InventoryMixin, OutletMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).allow('').required(),
      location: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).allow(null).required(),
      categoryCode: Joi.string().required()
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

  async _checkOrganizationPackageOutletLimit({ organizationId, aPackage }) {
    let outletList = await this.database.outlet.listByOrganizationId({ organizationId });
    if (outletList.length == aPackage.limits.maximumOutlets) {
      throw new CodedError("ORGANIZATION_PACKAGE_LIMIT_REACHED", this.verses.packageLimitCommon.activePackageLimitReached);
    }
  }

  async handle({ body }) {
    let { name, organizationId, physicalAddress, phone, contactPersonName, location, categoryCode } = body;
    let { aPackage } = this.interimData;
    await this._checkOrganizationPackageOutletLimit({ organizationId, aPackage });

    let categoryExists = await this.__checkIfCategoryCodeExists({ categoryCode });
    throwOnFalsy(categoryExists, "CATEGORY_INVALID", "Category code is invalid.");

    let outletId = await this._createOutlet({ name, organizationId, physicalAddress, phone, contactPersonName, location, categoryCode });

    if (location) {
      await this._createGeolocationCache({ outletId, location });
    }

    await this.__createStandardInventories({ inventoryContainerId: outletId, inventoryContainerType: "outlet", organizationId });
    return { status: "success", outletId }
  }

}