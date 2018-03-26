let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.DiscardSalesApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      salesId: Joi.number().max(999999999999999).required(),
    });
  }

  get accessControl() {
    return [{
      organizationBy: [
        {
          from: "sales",
          query: ({ salesId }) => ({ id: salesId }),
          select: "outletId",
          errorCode: "SALES_INVALID"
        },
        {
          from: "outlet",
          query: ({ outletId }) => ({ id: outletId }),
          select: "organizationId"
        }
      ],
      privileges: [
        "PRIV_VIEW_SALES"
      ]
    }];
  }

  _discardSales({ salesId }, cbfn) {
    this._discardDocById(this.database.sales, { salesId }, cbfn);
  }

  handle({ body, userId }) {
    let { salesId } = body;
    this._discardSales({ salesId }, _ => {
      this.success({ status: "success" });
    });
  }

}