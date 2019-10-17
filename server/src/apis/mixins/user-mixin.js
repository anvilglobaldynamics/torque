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
      var verificationToken = generateRandomString(5).toUpperCase();
      var isUnique = await this.database.phoneVerificationRequest.isVerificationTokenUnique({ verificationToken });
    } while (!isUnique);
    await this.database.phoneVerificationRequest.create({ originApp: this.clientApplication,  userId, phone, origin: 'user-register', verificationToken });
    let verificationLink = this._generatePhoneVerificationLink({ verificationToken });
    return verificationLink;
  }

  // TODO: try/catch mechanism since this method will not be awaited
  // NOTE: In most cases there is no reason to await this method
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

  // =============================== Phone Verification = End

  // =============================== Email Verification = Start

  _generateEmailVerificationLink({ verificationToken }) {
    let { serverUrl } = this.server.config.branding;
    return `${serverUrl}/verify-email/${verificationToken}`;
  }

  async _createEmailVerificationRequest({ email, userId }) {
    do {
      var verificationToken = generateRandomString(16);
      var isUnique = await this.database.emailVerificationRequest.isVerificationTokenUnique({ verificationToken });
    } while (!isUnique);
    await this.database.emailVerificationRequest.create({ userId, email, origin: 'user-register', verificationToken });
    let verificationLink = this._generateEmailVerificationLink({ verificationToken });
    return verificationLink;
  }

  // TODO: try/catch mechanism since this method will not be awaited
  // NOTE: In most cases there is no reason to await this method
  async _sendEmailVerificationMail({ email, verificationLink }) {
    let model = { email, verificationLink };
    let clientLanguage = (this.clientLanguage || 'en-us');
    let [err, isDeveloperError, response, finalBody] = await this.server.emailService.sendStoredMail(clientLanguage, 'email-verification', model, email);

    if ((err) || response.message !== 'Queued. Thank you.') {
      if (err) {
        if (!isDeveloperError) this.logger.error(err);
      } else {
        this.logger.log("Unexpected emailService response:", response);
      }
      let message = 'Failed to send email verification email. Please handle the case manually.'
      this.logger.important(message, {
        type: 'email-verification',
        verificationLink,
        model
      });
    }
  }


  // =============================== Email Verification = End

  // =============================== Password Change Notification = start

  async _sendPasswordChangeNotificationEmail({ user }) {
    let email = user.email;
    if (!email) return;
    let model = { email, textContent: this.verses.userNotificationCommon.yourPasswordHasChanged };
    let clientLanguage = (this.clientLanguage || 'en-us');
    let [err, isDeveloperError, response, finalBody] = await this.server.emailService.sendStoredMail(clientLanguage, 'generic-message', model, email);
    if ((err) || response.message !== 'Queued. Thank you.') {
      if (err) {
        if (!isDeveloperError) this.logger.error(err);
      } else {
        this.logger.log("Unexpected emailService response:", response);
      }
      let message = 'Failed to send password change notification email. Please handle the case manually.'
      this.logger.important(message, {
        type: 'generic-message',
        model
      });
    }
  }

  async  _sendPasswordChangeNotificationSms({ user }) {
    let phone = user.phone;
    let model = { phone, textContent: this.verses.userNotificationCommon.yourPasswordHasChanged };
    let [err, isDeveloperError, response, finalBody] = await this.server.smsService.sendStoredSms('generic-message', model, phone);
    if (err) {
      if (!isDeveloperError) this.logger.error(err);
      let message = 'Failed to send password change notification SMS. Please handle the case manually.'
      this.logger.important(message, {
        type: 'generic-message',
        finalBody
      });
    }
  }

  // TODO: try/catch mechanism since this method will not be awaited
  // NOTE: In most cases there is no reason to await this method
  async _notifyPasswordChange({ userId }) {
    let user = await this.database.user.findById({ id: userId });
    await this._sendPasswordChangeNotificationSms({ user });
    await this._sendPasswordChangeNotificationEmail({ user });
  }

  // =============================== Password Change Notification = end

  async __getUser({ userId }) {
    let user = await this.database.user.findById({ id: userId });
    throwOnFalsy(user, "USER_INVALID", "User could not be found");
    return { user };
  }

  async _createUser({ fullName, phone, password, agreedToTocDatetimeStamp, accessibleApplicationList }) {
    await this.applyGlobalUsageLimit({ useCase: 'register' });
    let passwordHash = this._makeHash(password);
    let userId = await this.database.user.create({ originApp: this.clientApplication, fullName, phone, passwordHash, agreedToTocDatetimeStamp, accessibleApplicationList });
    return userId;
  }

}
