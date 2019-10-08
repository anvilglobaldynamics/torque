const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

// NOTE: Contains shared features used by Lipi Lite

/** @param {typeof Api} SuperApiClass */
exports.LiteMixin = (SuperApiClass) => class extends SuperApiClass {

  async __validateLiteVerificationRequest({ verificationToken, phone }) {
    let verification = await this.database.phoneVerificationRequest._findOne({ verificationToken, forPhone: phone, isVerificationComplete: false });
    throwOnFalsy(verification, "PHONE_VERIFICATION_TOKEN_INVALID", "The verification token you provided is invalid");
  }

}