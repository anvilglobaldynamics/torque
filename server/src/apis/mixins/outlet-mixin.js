const { Api } = require('../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.OutletMixin = (SuperApiClass) => class extends SuperApiClass {

  async _createOutlet({ name, organizationId, physicalAddress, phone, contactPersonName, location, categoryCode, outletReceiptText }) {
    let outlet = {
      name, organizationId, physicalAddress, phone, contactPersonName, location, categoryCode, outletReceiptText,
      originApp: this.clientApplication
    }
    return await this.database.outlet.create(outlet);
  }

  async _createGeolocationCache({ outletId, location }) {
    return await this.database.cacheOutletGeolocation.create({ outletId, location });
  }

  async __varifyOutletIdList({ outletIdList }) {
    for (let i=0; i<outletIdList.length; i++) {
      let outlet = await this.database.outlet.findById({ id: outletIdList[i] });
      throwOnFalsy(outlet, "OUTLET_INVALID", "Outlet not found.");
    }
  }

  async __checkIfCategoryCodeExists({ categoryCode }) {
    return await this.database.fixture.findOutletCategoryByCode({ categoryCode });
  }

}