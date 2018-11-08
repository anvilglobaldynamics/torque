const { Api } = require('../api-base');
const Joi = require('joi');

exports.GetProductBlueprintListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['productBlueprintList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      searchString: Joi.string().min(0).max(64).allow('').optional()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_ALL_PRODUCT_BLUEPRINTS"
      ]
    }];
  }

  async _getProductBlueprintList({ organizationId, searchString }) {
    return await this.database.productBlueprint.listByOrganizationIdAndSearchString({ organizationId, searchString });
  }

  async handle({ body }) {
    let { organizationId, searchString } = body;
    let productBlueprintList = await this._getProductBlueprintList({ organizationId, searchString });

    return { productBlueprintList };
  }

}