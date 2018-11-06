
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.DiscardSalesApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      salesId: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: [
        {
          from: "sales",
          query: ({ salesId }) => ({ id: salesId }),
          select: "outletId",
          errorCode: "SALES_INVALID"
        },
        {
          from: "outlet",
          query: ({ outletId }) => ({ id: outletId }),
          select: "organizationId",
          errorCode: "OUTLET_INVALID"
        }
      ],
      privilegeList: [
        "PRIV_MODIFY_SALES"
      ]
    }];
  }

  async _listAndDiscardServiceMembership({ salesId }) {
    let serviceMembershipList = await this.database.serviceMembership.listBySalesId({ salesId });
    if (serviceMembershipList) {
      for (let i = 0; i < serviceMembershipList.length; i++) {
        await this.database.serviceMembership.discard({ id: serviceMembershipList[i].id }, { discardReason: "Sales Discarded." });
      }
    }
    return;
  }

  async handle({ body }) {
    let { salesId } = body;
    await this._listAndDiscardServiceMembership({ salesId });
    await this.database.sales.discard({ id: salesId });
    return { status: 'success' };
  }

}