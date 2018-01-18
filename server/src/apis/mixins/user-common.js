
let cryptolib = require('crypto');

exports.userCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _makeHash(string) {
    return cryptolib.createHash('sha256').update(string).digest("hex");
  }

  _sendPasswordChangeNotificationEmail({ user }) {
    let email = user.email;
    let model = { email, textContent: "Your password has changed." };
    this.server.emailService.sendStoredMail('generic-message', model, email, (err, isDeveloperError, response, finalBody) => {
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
    let model = { phone, textContent: "Your password has changed." };
    this.server.smsService.sendStoredSms('generic-message', model, phone, (err, isDeveloperError, response, finalBody) => {
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
    this.database.user.findById({ userId }, (err, user) => {
      if (err) return this.logger.error(err);
      this._sendPasswordChangeNotificationSms({ user });
      this._sendPasswordChangeNotificationEmail({ user });
    });
  }

  _createUser({ email, fullName, phone, password }, cbfn) {
    let passwordHash = this._makeHash(password);
    let user = {
      email,
      fullName,
      phone,
      passwordHash
    }
    this.database.user.create(user, (err, userId) => {
      if (err) return this.fail(err);
      return cbfn(userId);
    });
  }

}