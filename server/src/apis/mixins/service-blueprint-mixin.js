const { Api } = require('../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.ServiceBlueprintMixin = (SuperApiClass) => class extends SuperApiClass {

  __isVatPercentageValid({ vat }) {
    if (vat < 0 || vat > 100) {
      throw new CodedError("VAT_VALUE_INVALID", "Vat value is not within 0 to 100.");
    }
  }

  __isLongstandingServiceSetupValid({ isLongstanding, serviceDuration }) {
    if (!isLongstanding) {
      if (serviceDuration) {
        throw new CodedError("LONGSTANDING_SETUP_INVALID", "A flag and service duration is required.");
      }
    }

    if (isLongstanding) {
      if (!serviceDuration) {
        throw new CodedError("LONGSTANDING_SETUP_INVALID", "A flag and service duration is required.");
      }
    }
  }

}