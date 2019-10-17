
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

exports.LiteUserRegisterApi = class extends Api.mixin(SecurityMixin, UserMixin, OrganizationMixin, LiteMixin, OutletMixin, InventoryMixin) {

  get autoValidates() { return true; }

  get requiresAuthentication() { return false; }

  get isEnabled() { return true; }

  get requestSchema() {
    return Joi.object().keys({
      organizationName: Joi.string().min(1).max(64).required(),
      categoryCode: Joi.string().required(),
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      password: Joi.string().min(8).max(30).required(),
      // verificationToken: Joi.string().length(5).required(), // NOTE: Not currently validating user
      hasAgreedToToc: Joi.boolean().required().valid(true)
    });
  }

  async handle({ body }) {
    let { organizationName, categoryCode, fullName, phone, password, hasAgreedToToc } = body;

    let agreedToTocDatetimeStamp = (hasAgreedToToc ? Date.now() : null);

    let categoryExists = await this.__checkIfCategoryCodeExists({ categoryCode });
    throwOnFalsy(categoryExists, "CATEGORY_INVALID", "Category code is invalid.");

    // === user verification
    // NOTE: Not currently validating phone
    // await this.__validateLiteVerificationRequest({ verificationToken, phone });
    // await this.database.phoneVerificationRequest.applyVerificationToken({ verificationToken });

    // === user creation
    let userId = await this.__createUser({ fullName, phone, password, agreedToTocDatetimeStamp, accessibleApplicationList: ['torque-lite'] });

    // === organization creation
    let activeModuleCodeList = ['MOD_PRODUCT', 'MOD_SERVICE'];

    let organizationId = await this._createOrganization({
      name: organizationName,
      primaryBusinessAddress: 'Not Provided',
      phone,
      email: '',
      userId,
      activeModuleCodeList
    });
    this._createOrganizationSettings({ organizationId });

    await this._addModuleActivation({ organizationId, activeModuleCodeList });

    let employmentId = await this._setUserAsOwner({ userId, organizationId });

    // === outlet creation
    let location = { lat: 23.7945153, lng: 90.4139857 };

    let outletId = await this._createOutlet({
      name: organizationName + ' - Primary Outlet',
      organizationId,
      physicalAddress: 'Not Provided',
      phone,
      contactPersonName: fullName,
      location,
      categoryCode
    });

    await this._createGeolocationCache({ outletId, location });

    await this.__createStandardInventories({ inventoryContainerId: outletId, inventoryContainerType: "outlet", organizationId });

    // === end
    return { status: "success", userId, organizationId, employmentId };
  }

}