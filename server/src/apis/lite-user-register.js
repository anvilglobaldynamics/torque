
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');
const { SecurityMixin } = require('./mixins/security-mixin');
const { UserMixin } = require('./mixins/user-mixin');
const { OrganizationMixin } = require('./mixins/organization-mixin');
const { LiteMixin } = require('./mixins/lite-mixin');
const { OutletMixin } = require('./mixins/outlet-mixin');
const { InventoryMixin } = require('./mixins/inventory-mixin');
const { AccountingMixin } = require('./mixins/accounting-mixin');

exports.LiteUserRegisterApi = class extends Api.mixin(SecurityMixin, UserMixin, OrganizationMixin, LiteMixin, OutletMixin, InventoryMixin, AccountingMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get isEnabled() { return false; }

  get requestSchema() {
    return Joi.object().keys({
      organizationName: Joi.string().min(1).max(64).required(),
      categoryCode: Joi.string().required(),
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      countryCode: Joi.string().regex(/^[a-z0-9\+]*$/i).min(2).max(4).required(),
      password: Joi.string().min(8).max(30).required(),
      // verificationToken: Joi.string().length(6).required(), // NOTE: Not currently validating user
      hasAgreedToToc: Joi.boolean().required().valid(true)
    });
  }

  async handle({ body }) {
    let { organizationName, categoryCode, fullName, phone, password, hasAgreedToToc, countryCode } = body;

    let agreedToTocDatetimeStamp = (hasAgreedToToc ? Date.now() : null);

    let categoryExists = await this.__checkIfCategoryCodeExists({ categoryCode });
    throwOnFalsy(categoryExists, "CATEGORY_INVALID", "Category code is invalid.");

    // === user verification
    // NOTE: Not currently validating phone
    // await this.__validateLiteVerificationRequest({ verificationToken, phone });
    // await this.database.phoneVerificationRequest.applyVerificationToken({ verificationToken });

    // === user creation
    let userId = await this._createUser({ fullName, phone, password, agreedToTocDatetimeStamp, countryCode, accessibleApplicationList: ['torque-lite'] });

    // === organization creation
    let activeModuleCodeList = ['MOD_PRODUCT', 'MOD_SERVICE'];

    let organizationId = await this._createOrganization({
      name: organizationName,
      primaryBusinessAddress: 'Not Provided',
      phone,
      email: '',
      userId,
      countryCode,
      activeModuleCodeList
    });
    this._createOrganizationSettings({ organizationId });

    await this._addModuleActivation({ organizationId, activeModuleCodeList });

    let employmentId = await this._setUserAsOwner({ userId, organizationId });

    // === outlet creation
    let location = { lat: 24, lng: 89 };

    let outletName = (organizationName + ' - Primary Outlet').substring(0, 63);

    let outletId = await this._createOutlet({
      name: outletName,
      organizationId,
      physicalAddress: 'Not Provided',
      phone,
      contactPersonName: fullName,
      location,
      categoryCode,
      outletReceiptText: ''
    });

    await this._createGeolocationCache({ outletId, location });

    await this.__createStandardInventories({ inventoryContainerId: outletId, inventoryContainerType: "outlet", organizationId });

    // === payment methods
    // Accounting is required for default monetary account Ids
    await this.createDefaultAccounts({ organizationId, userId });
    await this.createDefaultPaymentMethods({ organizationId });

    // === end
    return { status: "success", userId, organizationId, employmentId };
  }

}