
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { generateRandomString } = require('./../utils/random-string');

const PHONE_VERIFICATION_WINDOW = 1 * 60 * 60 * 1000;

exports.ShopLocateNearbyOutletsApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get isEnabled() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      northEast: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
      }).required(),
      southWest: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required(),
      }).required(),
      categoryCode: Joi.string().min(0).max(128).allow(null),
      productName: Joi.string().min(0).max(128).allow('')
    });
  }

  async _listOutletGeolocationByBoundingRectangle({ northEast, southWest }) {
    let topRight = [northEast.lng, northEast.lat];
    let bottomLeft = [southWest.lng, southWest.lat];
    return await this.database.cacheOutletGeolocation._find({
      location: { $geoWithin: { $box: [bottomLeft, topRight] } }
    });
  }

  async _listOutletsByIdAndOptionallyCategoryCode({ outletIdList, categoryCode }) {
    console.log(categoryCode,outletIdList)
    if (categoryCode) {
      return await this.database.outlet.listByIdListAndCategoryCode({ idList: outletIdList, categoryCode });
    } else {
      return await this.database.outlet.listByIdList({ idList: outletIdList });
    }
  }

  async handle({ body }) {
    let { northEast, southWest, categoryCode, productName } = body;
    let outletGeolocationList = await this._listOutletGeolocationByBoundingRectangle({ northEast, southWest });
    let outletIdList = outletGeolocationList.map(outletGeolocation => outletGeolocation.outletId);
    let outletList = await this._listOutletsByIdAndOptionallyCategoryCode({ outletIdList, categoryCode });
    // console.log(outletIdList)
    // console.dir(outletIdList, { depth: null, showHidden: false })
    let finalOutletList = outletList.map(outlet => extract(outlet, ['name', 'location', 'id', 'categoryCode']));
    return {
      status: "success",
      outletList: finalOutletList
    }
  }

}