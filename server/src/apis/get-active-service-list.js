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

  async handle({ body }) {
    let { outletId, searchString } = body;
    let serviceList = await this.database.service.listByOutletIdAndSearchString({ outletId, searchString });
    return { serviceList };
  }

}