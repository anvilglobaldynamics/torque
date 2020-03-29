const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.ReportTrialBalanceApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),

      fromDate: Joi.number().max(999999999999999).required(),
      toDate: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_ACCOUNTING_REPORTS"
      ],
      moduleList: [
        "MOD_ACCOUNTING"
      ]
    }];
  }

  __getExtendedToDate(toDate) {
    toDate = new Date(toDate);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate = toDate.getTime();
    return toDate;
  }

  async __includeUserInformation({ collectionList }) {
    let map = await this.crossmap({
      source: collectionList,
      sourceKey: 'collectedByUserId',
      target: 'user'
    });
    map.forEach((user, collection) => {
      let { fullName, phone } = user;
      collection.collectedByUser = {
        fullName, phone
      }
    });
  }

  // NOTE: This is needed in order to avoid the initial payment taken during the creation
  // of a sale outside current boundary
  __filterByDateRange({ fromDate, toDate, collectionList }) {
    return collectionList.filter((collection) => {
      return fromDate <= collection.collectedDatetimeStamp && collection.collectedDatetimeStamp <= toDate;
    });
  }

  async handle({ body }) {
    let { organizationId, fromDate, toDate } = body;
    toDate = this.__getExtendedToDate(toDate);
    
    let fakeReport = [];
    return { fakeReport };
  }

}