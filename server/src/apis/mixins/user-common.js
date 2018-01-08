
let cryptolib = require('crypto');

exports.userCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _makeHash(string) {
    return cryptolib.createHash('sha256').update(string).digest("hex");
  }

  _notifyPasswordChange({ userId }, cbfn) {
    this.database.user.findById({ userId }, (err, user) => {
      if (err) return this.fail(err);
      let email = user.email;
      let model = { email, textContent: "Your password has changed." };
      this.server.emailService.sendStoredMail('generic-message', model, email, (err, response) => {
        if ((err) || response.message !== 'Queued. Thank you.') {
          this.logger.error(err);
          this.logger.log("Email service response:", response);
        }
      });
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
      if (err) {
        if ('code' in err && err.code === 'DUPLICATE_email') {
          err = new Error("Provided email address is already in use");
          err.code = 'EMAIL_ALREADY_IN_USE';
        }
        if ('code' in err && err.code === 'DUPLICATE_phone') {
          err = new Error("Provided phone number is already in use");
          err.code = 'PHONE_ALREADY_IN_USE';
        }
        return this.fail(err);
      }
      return cbfn(userId);
    });
  }

}