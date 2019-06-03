
let cryptolib = require('crypto');

exports.userCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _expireUserSessionRemotely({ userId }, cbfn) {
    this.legacyDatabase.session.expireByUserIdWhenFired({ userId }, (err) => {
      if (err) return this.fail(err);
      // FIXME: use ensureUpdate if required
      return cbfn();
    });
  }

  _makeHash(string) {
    return cryptolib.createHash('sha256').update(string).digest("hex");
  }

  _sendPasswordChangeNotificationEmail({ user }) {
    let email = user.email;
    if (!email) return;
    let model = { email, textContent: this.verses.userNotificationCommon.yourPasswordHasChanged };
    let clientLanguage = (this.clientLanguage || 'en-us');
    this.server.emailService.sendStoredMail(clientLanguage, 'generic-message', model, email).then(([err, isDeveloperError, response, finalBody]) => {
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
    });
  }

  _sendPasswordChangeNotificationSms({ user }) {
    let phone = user.phone;
    let model = { phone, textContent: this.verses.userNotificationCommon.yourPasswordHasChanged };
    this.server.smsService.sendStoredSms('generic-message', model, phone).then(([err, isDeveloperError, response, finalBody]) => {
      if (err) {
        if (!isDeveloperError) this.logger.error(err);
        let message = 'Failed to send password change notification SMS. Please handle the case manually.'
        this.logger.important(message, {
          type: 'generic-message',
          finalBody
        });
      }
    });
  }

  _notifyPasswordChange({ userId }) {
    this.legacyDatabase.user.findById({ userId }, (err, user) => {
      if (err) return this.logger.error(err);
      this._sendPasswordChangeNotificationSms({ user });
      this._sendPasswordChangeNotificationEmail({ user });
    });
  }

  _createUser({ fullName, phone, password, agreedToTocDatetimeStamp }, cbfn) {
    let passwordHash = this._makeHash(password);
    let user = {
      fullName,
      phone,
      passwordHash,
      agreedToTocDatetimeStamp
    }
    this.legacyDatabase.user.create(user, (err, userId) => {
      if (err) return this.fail(err);
      return cbfn(userId);
    });
  }

  _findUserByEmailOrPhone({ emailOrPhone }, cbfn) {
    this.legacyDatabase.user.findByEmailOrPhone({ emailOrPhone }, (err, user) => {
      if (!this._ensureDoc(err, user, "USER_DOES_NOT_EXIST", this.verses.userCommon.userDoesNotExist)) return;
      return cbfn(user);
    });
  }

  _findUserById({ userId }, cbfn) {
    this.legacyDatabase.user.findById({ userId }, (err, user) => {
      if (!this._ensureDoc(err, user, "USER_INVALID", this.verses.userCommon.userInvalid)) return;
      return cbfn(user);
    })
  }

  _setUserAsOwner({ userId, organizationId }, cbfn) {
    this.legacyDatabase.employment.employNewEmployeeAsOwner({ userId, organizationId }, (err) => {
      if (err) return this.fail(err);
      cbfn();
    })
  }

}