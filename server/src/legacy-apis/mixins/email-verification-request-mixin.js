
let { generateRandomString } = require('./../../utils/random-string');

exports.emailVerificationRequestMixin = (SuperApiClass) => class extends SuperApiClass {

  _generateVerificationLink(verificationToken) {
    let { serverUrl } = this.server.config.branding;
    return `${serverUrl}/verify-email/${verificationToken}`;
  }

  _sendEmailVerificationMail({ email, verificationLink: verificationLink }) {
    let model = { email, verificationLink };
    let clientLanguage = (this.clientLanguage || 'en-us');
    this.server.emailService.sendStoredMail(clientLanguage, 'email-verification', model, email).then(([err, isDeveloperError, response, finalBody]) => {
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
    let verificationToken = generateRandomString(16);
    this.legacyDatabase.emailVerificationRequest.isVerificationTokenUnique(verificationToken, (err, isUnique) => {
      if (err) return this.fail(err);
      if (!isUnique) return this._createEmailVerificationRequest({ email }, cbfn);
      this.legacyDatabase.emailVerificationRequest.create({ userId, email, origin: 'user-register', verificationToken }, (err) => {
        let verificationLink = this._generateVerificationLink(verificationToken);
        return cbfn(verificationLink);
      });
    })
  }

}