
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.UrlAnalyticsCollection = class extends Collection {

  get name() { return 'url-analytics'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      shouldShowInAdminStatistics: Joi.boolean().required(),
      which: Joi.string().valid('only'), // required for the query
      urlHits: Joi.object().required(), // not yet validated in depth as keys are uncertain
    });
  }

  async reportUrlHit({ name }) {
    let query = {
      which: 'only'
    };

    let key1 = `urlHits.${name}.count`;
    let key2 = `urlHits.${name}.lastHitDatetimeStamp`;
    let modifications = {
      $inc: {
        [key1]: 1
      },
      $set: {
        [key2]: (Date.now())
      }
    };
    let doc = await this._db.upsertAndReturnNew(this.name, query, modifications);
    if (!doc) {
      throw new CodedError("INTERNAL_DATABASE_ERROR", `Unable to update doc`);
    }
  }

}
