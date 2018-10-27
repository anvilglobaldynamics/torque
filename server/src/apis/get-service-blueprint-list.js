const { Api } = require('../api-base');
const Joi = require('joi');

exports.GetServiceBlueprintListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['serviceBlueprintList']; }

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
        "PRIV_VIEW_ALL_INVENTORIES"
      ]
    }];
  }

  async handle({ body }) {
    let { organizationId, searchString } = body;
    let serviceBlueprintList = await this.database.serviceBlueprint.listByOrganizationIdAndSearchString({ organizationId, searchString });

    return { serviceBlueprintList };
  }

}