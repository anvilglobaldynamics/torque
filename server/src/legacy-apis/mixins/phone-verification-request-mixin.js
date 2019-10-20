
let { generateRandomString } = require('./../../utils/random-string');

exports.phoneVerificationRequestMixin = (SuperApiClass) => class extends SuperApiClass {

  _generatePhoneVerificationLink(verificationToken) {
    let { serverUrl } = this.server.config.branding;
    return `${serverUrl}/verify-phone/${verificationToken}`;
  }

  _sendPhoneVerificationSms({ phone, verificationLink }) {
    let model = { phone, verificationLink };
    this.server.smsService.sendStoredSms('phone-verification', model, phone).then(([err, isDeveloperError, response, finalBody]) => {
      if (err) {
        if (!isDeveloperError) this.logger.error(err);
        let message = 'Failed to send phone verification SMS. Please handle the case manually.'
        this.logger.important(message, {
          type: 'phone-verification',
          finalBody
        });
      }
    });
  }

  _createPhoneVerificationRequest({ phone, userId }, cbfn) {
    let verificationToken = generateRandomString(6).toUpperCase();
    this.legacyDatabase.phoneVerificationRequest.isVerificationTokenUnique(verificationToken, (err, isUnique) => {
      if (err) return this.fail(err);
      if (!isUnique) return this._createPhoneVerificationRequest({ phone, userId }, cbfn);
      this.legacyDatabase.phoneVerificationRequest.create({ originApp: this.clientApplication, userId, phone, origin: 'user-register', verificationToken }, (err) => {
        let verificationLink = this._generatePhoneVerificationLink(verificationToken);
        return cbfn(verificationLink);
      });
    })
  }

}