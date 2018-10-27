const { Api } = require('../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.ServiceMixin = (SuperApiClass) => class extends SuperApiClass {

  async __activateServiceInOutlet({ createdByUserId, outletId, serviceBlueprintId, salePrice }) {
    let result = await this.database.service.findByOutletIdAndServiceBlueprintId({ outletId, serviceBlueprintId });

    if (result) {
      let res = await this.database.service.setAvailability({ id: result.id }, { isAvailable: true });
      throwOnFalsy(res, "GENERIC_ACTIVATION_ERROR", "Error occurred while activating.");
      return;
    }

    let res = await this.database.service.create({ createdByUserId, serviceBlueprintId, outletId, salePrice });
    throwOnFalsy(res, "GENERIC_ACTIVATION_ERROR", "Error occurred while activating.");
  }

  async __deactivateServiceInOutlet({ outletId, serviceBlueprintId }) {
    let result = await this.database.service.findByOutletIdAndServiceBlueprintId({ outletId, serviceBlueprintId });

    if (result) {
      let res = await this.database.service.setAvailability({ id: result.id }, { isAvailable: false });
      throwOnFalsy(res, "GENERIC_DEACTIVATION_ERROR", "Error occurred while activating.");
    }
  }

  async __validateServiceIdList({ serviceIdList }) {
    for (let i = 0; i < serviceIdList.length; i++) {
      let service = await this.database.service.findById({ id: serviceIdList[i] });
      throwOnFalsy(service, "SERVICE_INVALID", "Service could not be found.");
    }
  }

  async __updateService({ serviceId, salePrice, isAvailable }) {
    let res = this.database.service.setDetails({ id: serviceId }, { salePrice, isAvailable });
    throwOnFalsy(res, "GENERIC_UPDATE_ERROR", "Error occurred while updating.");
  }

}