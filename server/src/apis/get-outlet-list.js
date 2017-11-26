let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetOutletListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  _getOutletList(organizationId, cbfn) {
    this.database.outlet.listByOrganizationId(organizationId, (err, outletList) => {
      if (err) return this.fail(err);
      cbfn(outletList);
    })
  }

  handle({ body }) {
    let { organizationId } =  body;
    this._getOutletList(organizationId, (outletList) => {
      this.success({ outletList });
    });
  }

}