let { LegacyApi } = require('./../legacy-api-base');
let Joi = require('joi');

exports.GetRoleListApi = class extends LegacyApi {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({});
  }

  handle({ body }) {
    this.legacyDatabase.fixture.getRoleList((err, roleList) => {
      if (err) return this.fail(err);
      this.success({ roleList });
    });
  }

}