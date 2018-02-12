
let { Api } = require('./../api-base');
let Joi = require('joi');

exports.VerifyPhoneApi = class extends Api {

  _applyVerificationToken(verificationToken, cbfn) {
    this.database.phoneVerificationRequest.applyVerificationToken({ verificationToken }, (err, forUserId) => {
      if (err) return cbfn(err);
      this.database.user.setPhoneAsVerified({ userId: forUserId }, cbfn);
    })
  }

  _showFailed(message, err = new Error("Verification Failed")) {
    let errorObject = this.failable(err);
    let body = message;
    this.sendGenericHtmlMessage("Phone Verification Failed", body, errorObject);
  }

  _showSuccess() {
    let body = "Congratulations. You have successfully verified your phone number for torque.live. You can close this window."
    this.sendGenericHtmlMessage("Phone Verification Successful", body);
  }

  handle() {
    let params = this.getQueryParameters();
    if (!('link' in params)) {
      return this._showFailed('Invalid url format.');
    }
    let { error, value: verificationToken } = this.validate(params.link, Joi.string().length(64).required());
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

