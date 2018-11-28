
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { arrayUnique } = require('./../utils/array');

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
      searchString: Joi.string().min(3).max(128).allow('')
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
    if (categoryCode) {
      return await this.database.outlet.listByIdListAndCategoryCode({ idList: outletIdList, categoryCode });
    } else {
      return await this.database.outlet.listByIdList({ idList: outletIdList });
    }
  }

  async _filterOutletListBySearchString({ outletList, searchString }) {
    let organizationIdList = outletList.map(outlet => outlet.organizationId);
    organizationIdList = arrayUnique(organizationIdList);
    let productBlueprintList = await this.database.productBlueprint.listByOrganizationIdListAndSearchString({ organizationIdList, searchString });
    let servicetBlueprintList = await this.database.serviceBlueprint.listByOrganizationIdListAndSearchString({ organizationIdList, searchString });
    organizationIdList = [].concat(productBlueprintList.map(i => i.organizationId), servicetBlueprintList.map(i => i.organizationId));
    organizationIdList = arrayUnique(organizationIdList);
    return outletList.filter(outlet => organizationIdList.indexOf(outlet.organizationId) > -1);
  }

  async _appendOrganizationNameToOutletList({ outletList }) {
    let map = await this.crossmap({
      source: outletList,
      sourceKey: 'organizationId',
      target: 'organization'
    });
    map.forEach((organization, outlet) => outlet.organizationName = organization.name);
  }

  async handle({ body }) {
    let { northEast, southWest, categoryCode, searchString } = body;
    let outletGeolocationList = await this._listOutletGeolocationByBoundingRectangle({ northEast, southWest });
    let outletIdList = outletGeolocationList.map(outletGeolocation => outletGeolocation.outletId);
    let outletList = await this._listOutletsByIdAndOptionallyCategoryCode({ outletIdList, categoryCode });
    if (searchString.length > 0) {
      outletList = await this._filterOutletListBySearchString({ outletList, searchString });
    }
    await this._appendOrganizationNameToOutletList({ outletList });
    let finalOutletList = outletList.map(outlet => extract(outlet, ['id', 'organizationName', 'name', 'categoryCode', 'location']));
    return {
      outletList: finalOutletList
    }
  }

}