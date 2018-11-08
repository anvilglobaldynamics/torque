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

  async __updateService({ serviceId, salePrice, isAvailable }) {
    let res = this.database.service.setDetails({ id: serviceId }, { salePrice, isAvailable });
    throwOnFalsy(res, "GENERIC_UPDATE_ERROR", "Error occurred while updating.");
  }

  async __getAggregatedServiceList({ serviceList }) {
    (await this.crossmap({
      source: serviceList,
      sourceKey: 'serviceId',
      target: 'service',
      onError: (service) => { throw new CodedError("SERVICE_INVALID", "Invalid Service"); }
    })).forEach((service, _service) => {
      _service.service = service;
    });
    (await this.crossmap({
      source: serviceList,
      sourceKeyFn: (doc => doc.service.serviceBlueprintId),
      target: 'serviceBlueprint',
      onError: (service) => { throw new CodedError("SERVICE_BLUEPRINT_INVALID", "Invalid ServiceBlueprint"); }
    })).forEach((serviceBlueprint, _service) => {
      _service.service.serviceBlueprint = serviceBlueprint;
    });
  }

}