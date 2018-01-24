let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.GetSalesApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      salesId: Joi.number().max(999999999999999).required()
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

  _getSales({ salesId }, cbfn) {
    this.database.sales.findById({ salesId }, (err, sales) => {
      if (!this._ensureDoc(err, sales, "SALES_INVALID", "Sales not found")) return;
      return cbfn(sales);
    });
  }

  handle({ body }) {
    let { salesId } = body;
    this._getSales({ salesId }, (sales) => {
      this.success({ sales: sales });
    });
  }

}