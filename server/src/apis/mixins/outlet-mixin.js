const { Api } = require('../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.OutletMixin = (SuperApiClass) => class extends SuperApiClass {

  async __varifyOutletIdList({ outletIdList }) {
    for (let i=0; i<outletIdList.length; i++) {
      let outlet = await this.database.outlet.findById({ id: outletIdList[i] });
      throwOnFalsy(outlet, "OUTLET_INVALID", "Outlet not found.");
    }
  }

}