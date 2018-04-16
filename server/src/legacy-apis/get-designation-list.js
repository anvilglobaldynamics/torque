let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

exports.GetDesignationListApi = class extends LegacyApi {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({});
  }

  handle({ body }) {
    this.legacyDatabase.fixture.getDesignationList((err, designationList) => {
      if (err) return this.fail(err);
      this.success({ designationList });
    });
  }

}