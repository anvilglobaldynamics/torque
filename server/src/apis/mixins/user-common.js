
let cryptolib = require('crypto');

exports.userCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _makeHash(string) {
    return cryptolib.createHash('sha256').update(string).digest("hex");
  }

  _notifyPasswordChange({ userId }, cbfn) {
    this.database.user.getById(userId, (err, user) => {
      if (err) return this.fail(err);
      let email = user.email;
      let model = { email };
      this.server.emailService.sendStoredMail('generic-message', model, email, (err, response) => {
        if ((err) || response.message !== 'Queued. Thank you.') {
          this.logger.error(err);
          this.logger.log("Email service response:", response);
        }
      });
    });
  }

}