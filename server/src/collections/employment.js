
const { Collection } = require('./../collection-base');
const Joi = require('joi');
const { getPrivilegesSchemaFromJson, getPrivilegeListFromJson } = require('../utils/privilege-loader');

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
      privileges: getPrivilegesSchemaFromJson(),
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
    return getPrivilegeListFromJson();
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
      userId,
      organizationId,
      designation: 'Admin',
      role: 'admin',
      companyProvidedId: '',
      privileges: this.__generatePrivilegeModel(this.__fullPrivilegeList),
      isActive: true
    });
  }

  async addRegularEmployee({ userId, organizationId, role, designation, companyProvidedId, privileges }) {
    return await this._insert({
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
