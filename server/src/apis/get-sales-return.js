let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetSalesReturnApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      salesReturnId: Joi.number().max(999999999999999).required()
    });
  }

  _getSalesReturn({ salesReturnId }, cbfn) {
    this.database.salesReturn.findById({ salesReturnId }, (err, salesReturn) => {
      if (err) return this.fail(err);
      if (salesReturn === null) {
        err = new Error("sales return not found");
        err.code = "SALES_RETURN_INVALID";
        return this.fail(err);
      }
      return cbfn(salesReturn);
    });
  }

  handle({ body }) {
    let { salesReturnId } = body;
    this._getSalesReturn({ salesReturnId }, (salesReturn) => {
      this.success({ salesReturn: salesReturn });
    });
  }

}