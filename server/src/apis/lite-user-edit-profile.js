
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { generateRandomString } = require('./../utils/random-string');
const { SecurityMixin } = require('./mixins/security-mixin');
const { UserMixin } = require('./mixins/user-mixin');

exports.LiteUserEditProfileApi = class extends Api.mixin(UserMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({

      organizationId: Joi.number().max(999999999999999).required(),

      fullName: Joi.string().min(1).max(64).required(),
      organizationName: Joi.string().min(1).max(64).required(),
      categoryCode: Joi.string().required(),

    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId"
    }];
  }

  async handle({ userId, body }) {
    let { organizationId, fullName, organizationName, categoryCode } = body;

    let result = await this.database.user._update({ id: userId }, {
      $set: {
        fullName
      }
    });
    this.ensureUpdate('user', result);

    result = await this.database.organization._update({ id: organizationId }, {
      $set: {
        name: organizationName
      }
    });
    this.ensureUpdate('organization', result);

    let outletName = (organizationName + ' - Primary Outlet').substring(0, 63);
    result = await this.database.outlet._update({ organizationId }, {
      $set: {
        name: outletName,
        categoryCode
      }
    });
    this.ensureUpdate('outlet', result);

    return { status: "success", doesRequireLogin: true };
  }

}