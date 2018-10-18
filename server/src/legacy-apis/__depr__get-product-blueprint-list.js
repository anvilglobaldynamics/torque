let { LegacyApi } = require('../legacy-api-base');
let Joi = require('joi');

exports.GetProductBlueprintListApi = class extends LegacyApi {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      // apiKey: Joi.string().length(64).required(),

      organizationId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_ALL_INVENTORIES"
      ]
    }];
  }

  _getProductBlueprintList({ organizationId }, cbfn) {
    this.legacyDatabase.productBlueprint.listByOrganizationId({ organizationId }, (err, productBlueprintList) => {
      if (err) return this.fail(err);
      cbfn(productBlueprintList);
    })
  }

  handle({ body }) {
    let { organizationId } =  body;
    this._getProductBlueprintList({ organizationId }, (productBlueprintList) => {
      this.success({ productBlueprintList });
    });
  }

}