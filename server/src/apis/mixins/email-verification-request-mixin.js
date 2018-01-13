
let { generateRandomString } = require('./../../utils/random-string');

exports.emailVerificationRequestMixin = (SuperApiClass) => class extends SuperApiClass {

  _generateVerificationLink(verificationToken) {
    return `https://server1.torque.life/verify-email/${verificationToken}`;
  }

  _sendEmailVerificationMail({ email, verificationLink: verificationLink }) {
    let model = { email, verificationLink };
    this.server.emailService.sendStoredMail('email-verification', model, email, (err, isDeveloperError, response, finalBody) => {
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
    });
  }

  _createEmailVerificationRequest({ email, userId }, cbfn) {
    let verificationToken = generateRandomString(64);
    this.database.emailVerificationRequest.isVerificationTokenUnique(verificationToken, (err, isUnique) => {
      if (err) return this.fail(err);
      if (!isUnique) return this._createEmailVerificationRequest({ email }, cbfn);
      this.database.emailVerificationRequest.create({ userId, email, origin: 'user-register', verificationToken }, (err) => {
        let verificationLink = this._generateVerificationLink(verificationToken);
        return cbfn(verificationLink);
      });
    })
  }

}