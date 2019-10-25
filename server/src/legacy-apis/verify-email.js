
let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

exports.VerifyEmailApi = class extends LegacyApi {

  _applyVerificationToken(verificationToken, cbfn) {
    this.legacyDatabase.emailVerificationRequest.applyVerificationToken({ verificationToken }, (err, forUserId) => {
      if (err) return cbfn(err);
      this.legacyDatabase.user.setEmailAsVerified({ userId: forUserId }, () => {
        this.database.session.expireByUserId({ userId: forUserId }).then(() => {
          cbfn();
        });
      });
    })
  }

  _showFailed(message, err = new Error("Verification Failed")) {
    let errorObject = this.failable(err);
    let body = message;
    this.sendGenericHtmlMessage("Email Verification Failed", body, errorObject);
  }

  _showSuccess() {
    let { clientUrl } = this.server.config.branding;
    let body = `Congratulations. You have successfully verified your email address for <a href="${clientUrl}">${clientUrl}</a>. <br><br>\
                You can safely close this window or click the link above to open the web app on this device.`
    this.sendGenericHtmlMessage("Email Verification Successful", body);
  }

  handle() {
    let params = this.getQueryParameters();
    if (!('link' in params)) {
      return this._showFailed('Invalid url format.');
    }
    let { error, value: verificationToken } = this.validate(params.link, Joi.string().length(16).required());
    if (error) {
      let message = 'Verification token is not complete. Please make sure you copy the entire link.'
      return this._showFailed(message, error);
    }
    this._applyVerificationToken(verificationToken, (err) => {
      if (err) {
        let html = 'Failed to verify verification token. Please contact admin if you are sure it is a mistake.'
        return this._showFailed(html, err);
      }
      this._showSuccess();
    });
  }

}

