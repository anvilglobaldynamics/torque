let { Api } = require('./../api-base');
let Joi = require('joi');

let { collectionCommonMixin } = require('./mixins/collection-common');

exports.DeleteOutletApi = class extends collectionCommonMixin(Api) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),
      outletId: Joi.number().max(999999999999999).required(),
    });
  }

  _deleteOutlet({ outletId }, cbfn) {
    this._deleteDocById(this.database.outlet, { outletId }, cbfn);
  }

  handle({ body, userId }) {
    let { outletId } = body;
    this._deleteOutlet({ outletId }, _ => {
      this.success({ status: "success" });
    });
  }

}