const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.GetOutletCategoryListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({});
  }

  async handle({ body }) {
    // let packageList = await this.database.fixture.getPackageList();
    let categoryList = [];
    return { categoryList };
  }

}