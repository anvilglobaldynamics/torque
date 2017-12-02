
let { generateRandomString } = require('./../../utils/random-string');

exports.emailVerificationRequestMixin = (SuperApiClass) => class extends SuperApiClass {

  _generateVerificationLink(verificationToken) {
    return `https://server1.rewardables.life/verify-email/${verificationToken}`;
  }

  _sendVerificationMail({ email, verificationLink: activationLink }) {
    let model = { email, activationLink };
    this.server.emailService.sendStoredMail('email-verification', model, email, (err, response) => {
      if ((err) || response.message !== 'Queued. Thank you.') {
        this.logger.error(err);
        this.logger.log("Email service response:", response);
        let message = 'Failed to send verification email. Please handle the case manually.'
        this.logger.important(message, model);
      }
    });
  }

  _createEmailVerificationRequest({ email, userId }, cbfn) {
    let verificationToken = generateRandomString(64);
    this.database.emailVerificationRequest.ensureVerificationTokenIsUnique(verificationToken, (err, isUnique) => {
      if (err) return this.fail(err);
      if (!isUnique) return this._createEmailVerificationRequest({ email }, cbfn);
      this.database.emailVerificationRequest.create({ userId, email, origin: 'user-register', verificationToken }, (err) => {
        let verificationLink = this._generateVerificationLink(verificationToken);
        return cbfn(verificationLink);
      });
    })
  }

}