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

  get accessControl() {
    return [{
      organizationBy: {
        from: "outlet",
        query: ({ outletId }) => ({ id: outletId }),
        select: "organizationId",
        errorCode: "OUTLET_INVALID"
      },
      privileges: [
        "PRIV_MODIFY_ALL_OUTLETS"
      ]
    }];
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