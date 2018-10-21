const { Api } = require('../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.ServiceMixin = (SuperApiClass) => class extends SuperApiClass {

  async __activateServiceInOutlet({ createdByUserId, outletId, serviceBlueprintId, salePrice }) {
    let result = await this.database.service.findByOutletIdAndServiceBlueprintId({ outletId, serviceBlueprintId });

    if (result) {
      let res = await this.database.service.setAvailability({ id: result.id }, { isAvailable: true });
      throwOnFalsy(res, "GENERIC_ACTIVATION_ERROR", "Error occurred while activating.");
    }

    if(!result) {
      let res = await this.database.service.create({ createdByUserId, serviceBlueprintId, outletId, salePrice });
      throwOnFalsy(res, "GENERIC_ACTIVATION_ERROR", "Error occurred while activating.");
    }
  }

}