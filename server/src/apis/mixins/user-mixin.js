const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.UserMixin = (SuperApiClass) => class extends SuperApiClass {

  _generatePhoneVerificationLink({ verificationToken }) {
    let { serverUrl } = this.server.config.branding;
    return `${serverUrl}/verify-phone/${verificationToken}`;
  }

  async _sendPhoneVerificationSms({ phone, verificationLink }) {
    let model = { phone, verificationLink };
    let [err, isDeveloperError, response, finalBody] = await this.server.smsService.sendStoredSms('phone-verification', model, phone);
    if (err) {
      if (!isDeveloperError) this.logger.error(err);
      let message = 'Failed to send phone verification SMS. Please handle the case manually.'
      this.logger.important(message, {
        type: 'phone-verification',
        finalBody
      });
    }
  }

  async __getUser({ userId }) {
    let user = await this.database.user.findById({ id: userId });
    throwOnFalsy(user, "USER_INVALID", "User could not be found");
    return { user };
  }

}