const { Api } = require('../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.ServiceBlueprintMixin = (SuperApiClass) => class extends SuperApiClass {

  _isVatPercentageValid({ vat }) {
    if (vat < 0 || vat > 100) {
      throw new CodedError("VAT_VALUE_INVALID", "Vat value is not within 0 to 100.");
    }
  }

}