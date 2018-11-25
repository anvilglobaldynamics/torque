
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.CacheOutletGeolocationCollection = class extends Collection {

  get name() { return 'cache-outlet-geolocation'; }

  get joiSchema() {
    return Joi.object().keys({
      outletId: Joi.number().required(),
      location: Joi.object().keys({
        type: Joi.string().valid("Point"),
        coordinates: Joi.array().items(
          Joi.number().required(),
          Joi.number().required()
        ).length(2).required()
      }).required()
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'outlet',
        foreignKey: 'id',
        referringKey: 'outletId'
      }
    ];
  }

  async create({ outletId, location }) {
    let { lat, lng } = location;
    return await this._insert({
      outletId,
      location: {
        type: 'Point',
        coordinates: [lat, lng]
      }
    });
  }

  async setLocationByOutletId({ outletId }, { location }) {
    return await this._update({ outletId }, {
      $set: {
        location: {
          type: 'Point',
          coordinates: [lat, lng]
        }
      }
    });
  }


}
