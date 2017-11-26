let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetOutletApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      outletId: Joi.number().max(999999999999999).required()
    });
  }

  _getOutlet(outletId, cbfn) {
    this.database.outlet.getByOutletId(outletId, (err, outlet) => {
      if (err) return this.fail(err);
      cbfn(outlet);
    })
  }

  handle({ body }) {
    let { outletId } =  body;
    this._getOutlet(outletId, (outlet) => {
      this.success({ outlet });
    });
  }

}