let { Api } = require('./../api-base');
let Joi = require('joi');

exports.DeleteOutletApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      outletId: Joi.number().max(999999999999999).required(),
    });
  }

  _deleteOutlet({ outletId }, cbfn) {
    this.database.outlet.delete({ outletId }, (err, wasUpdated) => {
      if (err) return this.fail(err);
      if (!wasUpdated) return this.fail(new Error('Unable to find outlet to update'));
      return cbfn();
    });
  }

  handle({ body, userId }) {
    let { outletId } = body;
    this._deleteOutlet({ outletId }, _ => {
      this.success({ status: "success" });
    });
  }

}