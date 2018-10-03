const { throwOnFalsy, throwOnTruthy, CodedError } = require('../../utils/coded-error');

exports.CustomerMixin = (SuperApiClass) => class extends SuperApiClass {}