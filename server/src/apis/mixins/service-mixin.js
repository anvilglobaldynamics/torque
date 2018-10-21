const { Api } = require('../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.ServiceMixin = (SuperApiClass) => class extends SuperApiClass {

  async __activateServiceInOutlet({ createdByUserId, serviceBlueprintId, outletId, salePrice }) {
    let serviceBlueprint = await this.database.serviceBlueprint.findById({ id: serviceBlueprintId });
    throwOnFalsy(serviceBlueprint, "SERVICE_BLUEPRINT_INVALID", "service blueprint not found");

    let result = await this.database.service.findByOutletIdAndServiceBlueprintId({ outletId, serviceBlueprintId });

    if (result) {
      // active old service
      console.log("found existing: ", result);
    }

    if(!result) {
      await this.database.service.create({ createdByUserId, serviceBlueprintId, outletId, salePrice });
    }
  }

}