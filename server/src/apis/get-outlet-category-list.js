const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');

exports.GetOutletCategoryListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get requestSchema() {
    return Joi.object().keys({});
  }

  async handle({ body }) {
    let categoryList = await this.database.fixture.getOutletCategoryList() ;
    return { categoryList };
  }

}