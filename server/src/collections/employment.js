
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.EmploymentCollection = class extends Collection {

  get name() { return 'employment'; }

  get joiSchema() {
    return Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      userId: Joi.number().max(999999999999999).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      designation: Joi.string().max(64).required(),
      role: Joi.string().max(64).required(),
      companyProvidedId: Joi.string().allow('').max(64).required(),
      privileges: Joi.object().required().keys({
        PRIV_VIEW_USERS: Joi.boolean().required(),
        PRIV_MODIFY_USERS: Joi.boolean().required(),

        PRIV_ACCESS_POS: Joi.boolean().required(),
        PRIV_VIEW_SALES: Joi.boolean().required(),
        PRIV_MODIFY_SALES: Joi.boolean().required(),
        PRIV_ALLOW_FLAT_DISCOUNT: Joi.boolean().required(),

        PRIV_VIEW_ALL_SERVICE_MEMBERSHIPS: Joi.boolean().required(),
        PRIV_MODIFY_ALL_SERVICE_MEMBERSHIPS: Joi.boolean().required(),

        PRIV_VIEW_SALES_RETURN: Joi.boolean().required(),
        PRIV_MODIFY_SALES_RETURN: Joi.boolean().required(),

        PRIV_VIEW_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_VIEW_ALL_SERVICES: Joi.boolean().required(),
        PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS: Joi.boolean().required(),
        PRIV_MODIFY_ALL_SERVICE_BLUEPRINTS: Joi.boolean().required(),
        PRIV_VIEW_ALL_SERVICE_BLUEPRINTS: Joi.boolean().required(),
        PRIV_VIEW_ALL_PRODUCT_BLUEPRINTS: Joi.boolean().required(),
        PRIV_TRANSFER_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_ADD_PRODUCTS_TO_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_MODIFY_ALL_SERVICES_AVAILABILITY_IN_ALL_OUTLETS: Joi.boolean().required(),

        PRIV_VIEW_ALL_OUTLETS: Joi.boolean().required(),
        PRIV_MODIFY_ALL_OUTLETS: Joi.boolean().required(),

        PRIV_VIEW_ALL_WAREHOUSES: Joi.boolean().required(),
        PRIV_MODIFY_ALL_WAREHOUSES: Joi.boolean().required(),

        PRIV_VIEW_ORGANIZATION_STATISTICS: Joi.boolean().required(),
        PRIV_MODIFY_ORGANIZATION: Joi.boolean().required(),

        PRIV_VIEW_CUSTOMER: Joi.boolean().required(),
        PRIV_MODIFY_CUSTOMER: Joi.boolean().required(),
        PRIV_MANAGE_CUSTOMER_WALLET_BALANCE: Joi.boolean().required()
      }),
      isActive: Joi.boolean().required()
    });
  }

  get uniqueKeyDefList() {
    return [];
  }

  get foreignKeyDefList() {
    return [
      {
        targetCollection: 'organization',
        foreignKey: 'id',
        referringKey: 'organizationId'
      },
      {
        targetCollection: 'user',
        foreignKey: 'id',
        referringKey: 'userId'
      }
    ];
  }

  get __fullPrivilegeList() {
    return [
      "PRIV_VIEW_USERS",
      "PRIV_MODIFY_USERS",

      "PRIV_ACCESS_POS",
      "PRIV_VIEW_SALES",
      "PRIV_MODIFY_SALES",
      "PRIV_ALLOW_FLAT_DISCOUNT",

      "PRIV_VIEW_ALL_SERVICE_MEMBERSHIPS",
      "PRIV_MODIFY_ALL_SERVICE_MEMBERSHIPS",

      "PRIV_VIEW_SALES_RETURN",
      "PRIV_MODIFY_SALES_RETURN",

      "PRIV_VIEW_ALL_INVENTORIES",
      "PRIV_VIEW_ALL_SERVICES",
      "PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS",
      "PRIV_MODIFY_ALL_SERVICE_BLUEPRINTS",
      "PRIV_VIEW_ALL_SERVICE_BLUEPRINTS",
      "PRIV_VIEW_ALL_PRODUCT_BLUEPRINTS",
      "PRIV_TRANSFER_ALL_INVENTORIES",
      "PRIV_ADD_PRODUCTS_TO_ALL_INVENTORIES",
      "PRIV_MODIFY_ALL_SERVICES_AVAILABILITY_IN_ALL_OUTLETS",

      "PRIV_VIEW_ALL_OUTLETS",
      "PRIV_MODIFY_ALL_OUTLETS",

      "PRIV_VIEW_ALL_WAREHOUSES",
      "PRIV_MODIFY_ALL_WAREHOUSES",

      "PRIV_VIEW_ORGANIZATION_STATISTICS",
      "PRIV_MODIFY_ORGANIZATION",

      "PRIV_VIEW_CUSTOMER",
      "PRIV_MODIFY_CUSTOMER",
      "PRIV_MANAGE_CUSTOMER_WALLET_BALANCE"
    ];
  }

  __generatePrivilegeModel(allowedPrivilegeList) {
    let privileges = {};
    this.__fullPrivilegeList.forEach(privilege => {
      if (allowedPrivilegeList.indexOf(privilege) > -1) {
        privileges[privilege] = true;
      } else {
        privileges[privilege] = false;
      }
    });
    return privileges;
  }

  async addOwner({ organizationId, userId }) {
    return await this._insert({
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      userId,
      organizationId,
      designation: 'Owner',
      role: 'owner',
      companyProvidedId: '',
      privileges: this.__generatePrivilegeModel(this.__fullPrivilegeList),
      isActive: true
    });
  }

  async addRegularEmployee({ userId, organizationId, role, designation, companyProvidedId, privileges }) {
    return await this._insert({
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      userId,
      organizationId,
      designation,
      role,
      companyProvidedId,
      privileges,
      isActive: true
    });
  }

  async listByOrganizationId({ organizationId }) {
    return await this._find({ organizationId });
  }

  async listEmploymentOfUserInOrganization({ userId, organizationId }) {
    return await this._find({ userId, organizationId });
  }

  async getLatestActiveEmploymentOfUserInOrganization({ userId, organizationId }) {
    return await this._findOne({ userId, organizationId });
  }

  async listEmploymentsOfUser({ userId }) {
    return await this._find({ userId });
  }

  async listActiveEmploymentsOfUser({ userId }) {
    return await this._find({ userId, isActive: true });
  }

  async setActiveStatus({ id }, { isActive }) {
    return await this._update({ id }, {
      $set: {
        isActive
      }
    });
  }

  async setDetails({ id }, { role, designation, companyProvidedId, privileges }) {
    return await this._update({ id }, {
      $set: {
        role, designation, companyProvidedId, privileges
      }
    });
  }

}
