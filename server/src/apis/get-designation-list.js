
let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetDesignationListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({});
  }

  handle({ body }) {
    this.database.fixture.getDesignationList((err, designationList) => {
      if (err) return this.fail(err);
      this.success({ designationList });
    });
  }

}

