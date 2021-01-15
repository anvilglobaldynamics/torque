
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { OrganizationMixin } = require('./mixins/organization-mixin');
const { AccountingMixin } = require('./mixins/accounting-mixin');

exports.AddOrganizationApi = class extends Api.mixin(OrganizationMixin, AccountingMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).allow('').required(),
      email: Joi.string().email().min(3).max(30).allow('').required(),
      activeModuleCodeList: Joi.array().items(
        Joi.string().required()
      ).optional().default(['MOD_PRODUCT', 'MOD_SERVICE', 'MOD_ACCOUNTING']),
      promoCode: Joi.string().min(0).max(12).allow('').default('').optional()
    });
  }

  // NOTE: Also change on the client's page-register.html
  _validatePromoCode({ promoCode }) {
    if (!promoCode || promoCode.length === 0) {
      return;
    }

    const allowedPromoCodeList = [
      'PKSF-BASA',
      'PKSF-CDIP',
      'PKSF-ESDO',
      'PKSF-GJUS',
      'PKSF-JAKAS',
      'PKSF-PDK',
      'PKSF-PIDIM',
      'PKSF-SDI',
      'PKSF-SNF',
      'PKSF-SSS',
    ];

    if (allowedPromoCodeList.indexOf(promoCode) === -1) {
      throw new CodedError("INVALID_PROMO_CODE", "Promo Code is invalid.");
    }
  }

  async handle({ body, userId }) {
    let { name, primaryBusinessAddress, phone, email, activeModuleCodeList, promoCode } = body;
    await this._checkIfMaxOrganizationLimitReached({ userId });

    this._validatePromoCode({ promoCode });

    await this._validatedactiveModuleCodeList({ activeModuleCodeList });

    let organizationId = await this._createOrganization({ name, primaryBusinessAddress, phone, email, userId, activeModuleCodeList, promoCode });
    this._createOrganizationSettings({ organizationId });

    let employmentId = await this._setUserAsOwner({ userId, organizationId });
    await this._setTrialPackage({ organizationId });
    await this._addModuleActivation({ organizationId, activeModuleCodeList });

    await this.createDefaultAccounts({ organizationId, userId });
    await this.createDefaultPaymentMethods({ organizationId });

    return { status: "success", organizationId, employmentId };
  }

}