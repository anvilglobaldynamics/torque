const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');
const { generateRandomString } = require('./../../utils/random-string');

/** @param {typeof Api} SuperApiClass */
exports.UserMixin = (SuperApiClass) => class extends SuperApiClass {

  // =============================== Phone Verification = Start

  _generatePhoneVerificationLink({ verificationToken }) {
    let { serverUrl } = this.server.config.branding;
    return `${serverUrl}/verify-phone/${verificationToken}`;
  }

  async _createPhoneVerificationRequest({ phone, userId }) {
    do {
      var verificationToken = generateRandomString(16);
      var isUnique = await this.database.phoneVerificationRequest.isVerificationTokenUnique({ verificationToken });
    } while (!isUnique);
    await this.database.phoneVerificationRequest.create({ userId, phone, origin: 'user-register', verificationToken });
    let verificationLink = this._generatePhoneVerificationLink({ verificationToken });
    return { verificationLink };
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