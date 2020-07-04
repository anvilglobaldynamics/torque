
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

    const allowedNamesWithPublicKey = [
      'LipiAppAndroid',
      'LipiAppPwa',
      'LipiAppAndroidLegacy',
      'LipiAppPwaLegacy',
      'app.lipi.live android',
      'app.lipi.live/register?ref=fb',
      'app.lipi.live/register?ref=ln',
      'app.lipi.live/register?ref=mail',
      'app.lipi.live/register?ref=lipi',
      'app.lipi.live/register',
      'app.lipi.live',
    ];
    if (!(pssk === this.pssk || (pssk === 'app-lipi-live-public-key' && (allowedNamesWithPublicKey.indexOf(name) > -1)))) {
      throw new CodedError("PSSK_INVALID", "Preshared Secret Key is Inavlid");
    }

    await this.database.urlAnalytics.reportUrlHit({ name });

    return {};
  }

}