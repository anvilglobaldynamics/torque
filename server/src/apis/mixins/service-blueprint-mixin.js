const { Api } = require('../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.ServiceBlueprintMixin = (SuperApiClass) => class extends SuperApiClass {

  __isVatPercentageValid({ vat }) {
    if (vat < 0 || vat > 100) {
      throw new CodedError("VAT_VALUE_INVALID", "Vat value is not within 0 to 100.");
    }
  }

  __isLongstandingServiceSetupValid({ isLongstanding, serviceDuration, isCustomerRequired }) {
    if (!isLongstanding) {
      if (serviceDuration) {
        throw new CodedError("LONGSTANDING_SETUP_INVALID", "A flag, service duration and customer are required.");
      }
    }

    if (isLongstanding) {
      if (!serviceDuration || !isCustomerRequired) {
        throw new CodedError("LONGSTANDING_SETUP_INVALID", "A flag, service duration and customer are required.");
      }
    }
  }

  async __varifyServiceBlueprintList({ serviceBlueprintList }) {
    for (let i=0; i<serviceBlueprintList.length; i++) {
      // issue 472 case
      let serviceBlueprint = await this.database.serviceBlueprint.findById({ id: serviceBlueprintList[i].serviceBlueprintId });
      throwOnFalsy(serviceBlueprint, "SERVICE_BLUEPRINT_INVALID", "Service blueprint not found.");
    }
  }

}