let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetPrivilegeListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({});
  }

  handle({ body }) {
    this.database.fixture.getPrivilegeList((err, privilegeList) => {
      if (err) return this.fail(err);
      this.success({ privilegeList });
    });
  }

}