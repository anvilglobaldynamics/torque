const { Api } = require('./../../api-base');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

/** @param {typeof Api} SuperApiClass */
exports.UserMixin = (SuperApiClass) => class extends SuperApiClass {

  async __getUser({ userId }) {
    let user = await this.database.user.findById({ id: userId });
    throwOnFalsy(user, "USER_INVALID", "User could not be found");
    return { user };
  }
  
}