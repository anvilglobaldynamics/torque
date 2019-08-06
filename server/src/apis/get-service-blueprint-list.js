const { Api } = require('../api-base');
const Joi = require('joi');

exports.GetServiceBlueprintListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['serviceBlueprintList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      searchString: Joi.string().min(0).max(64).allow('').optional(),
      serviceBlueprintIdList: Joi.array().items(Joi.number()).default([]).optional()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_ALL_SERVICE_BLUEPRINTS"
      ],
      moduleList: [
        "MOD_SERVICE",
      ]
    }];
  }

  async _getServiceBlueprintList({ organizationId, searchString, serviceBlueprintIdList }) {
    if (serviceBlueprintIdList.length > 0) {
      let serviceBlueprintList = await this.database.serviceBlueprint.listByOrganizationIdAndIdList({ organizationId, idList: serviceBlueprintIdList });
      if (serviceBlueprintList.length !== serviceBlueprintIdList.length) {
        throw new CodedError("SERVICE_BLUEPRINT_INVALID", "The service blueprint you provided is invalid");
      }
      return serviceBlueprintList;
    } else {
      return await this.database.serviceBlueprint.listByOrganizationIdAndSearchString({ organizationId, searchString });
    }
  }

  async handle({ body }) {
    let { organizationId, searchString, serviceBlueprintIdList } = body;

    let serviceBlueprintList = await this._getServiceBlueprintList({ organizationId, searchString, serviceBlueprintIdList });

    return { serviceBlueprintList };
  }

}