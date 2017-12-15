
let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetRoleListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({});
  }

  handle({ body }) {
    this.database.fixture.getRoleList((err, roleList) => {
      if (err) return this.fail(err);
      this.success({ roleList });
    });
  }

}

