
const { Api } = require('../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../utils/coded-error');

exports.AnalyticsReportUrlHitApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      pssk: Joi.string().min(8).max(32).required(),
      name: Joi.string().min(8).max(32).required()
    });
  }

  // NOTE: This key is added as extra security since this api is only meant to be called internally
  get pssk() {
    return 'D1doF#sENM5w';
  }

  async handle({ body }) {
    let { pssk, name } = body;
    if (!(pssk === this.pssk || (pssk === 'app-lipi-live-public-key' && (name === 'LipiAppPwa' || name === 'LipiAppPwaLegacy')))) {
      throw new CodedError("PSSK_INVALID", "Preshared Secret Key is Inavlid");
    }

    await this.database.urlAnalytics.reportUrlHit({ name });

    return {};
  }

}