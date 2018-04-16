let { Api } = require('./../api-base');
let Joi = require('joi');

exports.GetOutletListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['outletList']; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      organizationId: Joi.number().max(999999999999999).required(),
      searchString: Joi.string().min(0).max(64).allow('').optional()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privileges: [
        "PRIV_VIEW_ALL_OUTLETS"
      ]
    }];
  }

  _getOutletList({ organizationId, searchString }, cbfn) {
    this.legacyDatabase.outlet.listByOrganizationIdAndSearchString({ organizationId, searchString }, (err, outletList) => {
      if (err) return this.fail(err);
      return cbfn(outletList);
    })
  }

  handle({ body }) {
    let { organizationId, searchString = null } = body;
    this._getOutletList({ organizationId, searchString }, (outletList) => {
      this.success({ outletList });
    });
  }

}