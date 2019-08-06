const { Api } = require('../api-base');
const Joi = require('joi');

exports.GetProductBlueprintListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['productBlueprintList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      searchString: Joi.string().min(0).max(64).allow('').optional(),
      productBlueprintIdList: Joi.array().items(Joi.number()).default([]).optional()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_ALL_PRODUCT_BLUEPRINTS"
      ],
      moduleList: [
        "MOD_PRODUCT",
      ]
    }];
  }

  async _getProductBlueprintList({ organizationId, searchString, productBlueprintIdList }) {
    if (productBlueprintIdList.length > 0) {
      let productBlueprintList = await this.database.productBlueprint.listByOrganizationIdAndIdList({ organizationId, idList: productBlueprintIdList });
      if (productBlueprintList.length !== productBlueprintIdList.length) {
        throw new CodedError("PRODUCT_BLUEPRINT_INVALID", "The product blueprint you provided is invalid");
      }
      return productBlueprintList;
    } else {
      return await this.database.productBlueprint.listByOrganizationIdAndSearchString({ organizationId, searchString });
    }
  }

  async handle({ body }) {
    let { organizationId, searchString, productBlueprintIdList } = body;
    let productBlueprintList = await this._getProductBlueprintList({ organizationId, searchString, productBlueprintIdList });

    return { productBlueprintList };
  }

}