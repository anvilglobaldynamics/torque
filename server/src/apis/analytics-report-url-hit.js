
const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');

exports.AnalyticsReportUrlHitApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      pssk: Joi.string().length(12).required(),
      name: Joi.string().min(8).max(32).required()
    });
  }

  get pssk() {
    return 'D1doF#sENM5w';
  }

  async handle({ body }) {
    let { pssk, name } = body;
    if (pssk !== this.pssk) {
      throw new CodedError("PSSK_ERROR", "Preshared Secret Key is Inavlid");
    }

    this.database.urlAnalytics.reportUrlHit({ name });

    return {};
  }

}