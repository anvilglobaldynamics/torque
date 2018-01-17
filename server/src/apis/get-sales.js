let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetSalesApi = class extends Api {

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
          select: "customerId",
          errorCode: "SALES_INVALID"
        },
        {
          from: "customer",
          query: ({ customerId }) => ({ id: customerId }),
          select: "organizationId"
        }
      ],
      privileges: [
        "PRIV_MODIFY_CUSTOMER"
      ]
    }];
  }

  _getSales({ salesId }, cbfn) {
    this.database.sales.findById({ salesId }, (err, sales) => {
      if (err) return this.fail(err);
      if (sales === null) {
        err = new Error("sales could not be found");
        err.code = "SALES_INVALID";
        return this.fail(err);
      }
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