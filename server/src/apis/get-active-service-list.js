const { Api } = require('../api-base');
const Joi = require('joi');

exports.GetActiveServiceListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['serviceList']; }

  get requestSchema() {
    return Joi.object().keys({
      outletId: Joi.number().max(999999999999999).required(),
      searchString: Joi.string().min(0).max(64).allow('').optional()
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
      privilegeList: [
        "PRIV_VIEW_ALL_SERVICES"
      ]
    }];
  }

  async _combineServiceBlueprintDetail({ serviceList }) {
    (await this.crossmap({
      source: serviceList,
      sourceKeyFn: (doc => doc.serviceBlueprintId),
      target: 'serviceBlueprint',
      onError: (service) => { throw new CodedError("SERVICE_BLUEPRINT_INVALID", "Invalid serviceBlueprintId"); }
    })).forEach((serviceBlueprint, service) => {
      service.serviceBlueprint = serviceBlueprint;
    });
  }

  async _searchCombineServiceList({ serviceList, searchString }) {
    serviceList = serviceList.filter(service => {
      searchString = this.escapeRegExp(searchString);
      let regex = new RegExp(searchString, 'i');
      return regex.test(service.serviceBlueprint.name);
    });

    return serviceList;
  }

  async handle({ body }) {
    let { outletId, searchString } = body;
    let serviceList = await this.database.service.listAvailableByOutletId({ outletId });
    await this._combineServiceBlueprintDetail({ serviceList });
    if (searchString) {
      serviceList = await this._searchCombineServiceList({ serviceList, searchString });
    }
    
    return { serviceList };
  }

}