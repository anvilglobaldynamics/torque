
const { Collection } = require('./../collection-base');
const Joi = require('joi');

exports.EmploymentCollection = class extends Collection {

  constructor(...args) {
    super(...args);

    this.collectionName = 'employment';

    this.joiSchema = Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      userId: Joi.number().max(999999999999999).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      designation: Joi.string().max(1024).required(),
      role: Joi.string().max(1024).required(),
      companyProvidedId: Joi.string().alphanum().allow('').required(),
      privileges: Joi.object().keys({
        PRIV_VIEW_USERS: Joi.boolean().required(),
        PRIV_MODIFY_USERS: Joi.boolean().required(),
        PRIV_ADD_USER: Joi.boolean().required(),
        PRIV_MAKE_USER_AN_OWNER: Joi.boolean().required(),
        PRIV_MODIFY_USER_PRIVILEGES: Joi.boolean().required(),

        PRIV_ACCESS_POS: Joi.boolean().required(),
        PRIV_VIEW_SALES: Joi.boolean().required(),
        PRIV_MODIFY_SALES: Joi.boolean().required(),
        PRIV_ALLOW_FLAT_DISCOUNT: Joi.boolean().required(),
        PRIV_ALLOW_INDIVIDUAL_DISCOUNT: Joi.boolean().required(),
        PRIV_ALLOW_FOC: Joi.boolean().required(),

        PRIV_VIEW_SALES_RETURN: Joi.boolean().required(),
        PRIV_MODIFY_SALES_RETURN: Joi.boolean().required(),

        PRIV_VIEW_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_MODIFY_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_TRANSFER_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_REPORT_DAMAGES_IN_ALL_INVENTORIES: Joi.boolean().required(),

        PRIV_VIEW_ALL_OUTLETS: Joi.boolean().required(),
        PRIV_MODIFY_ALL_OUTLETS: Joi.boolean().required(),

        PRIV_VIEW_ALL_WAREHOUSES: Joi.boolean().required(),
        PRIV_MODIFY_ALL_WAREHOUSES: Joi.boolean().required(),

        PRIV_VIEW_ORGANIZATION_STATISTICS: Joi.boolean().required(),
        PRIV_MODIFY_ORGANIZATION: Joi.boolean().required(),

        PRIV_VIEW_CUSTOMER: Joi.boolean().required(),
        PRIV_ADD_CUSTOMER_DURING_SALES: Joi.boolean().required(),
        PRIV_MODIFY_CUSTOMER: Joi.boolean().required(),
        PRIV_MANAGE_CUSTOMER_DEBT: Joi.boolean().required()
      }),
      isActive: Joi.boolean().required(),
    });

    this.uniqueKeyDefList = [
      {
        filters: {},
        keyList: []
      }
    ];

    this.foreignKeyDefList = [
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

  __makePrivilegeModel(isForAnOwner) {
    let privilegeList = [
      "PRIV_VIEW_USERS",
      "PRIV_MODIFY_USERS",
      "PRIV_ADD_USER",
      "PRIV_MAKE_USER_AN_OWNER",
      "PRIV_MODIFY_USER_PRIVILEGES",

      "PRIV_ACCESS_POS",
      "PRIV_VIEW_SALES",
      "PRIV_MODIFY_SALES",
      "PRIV_ALLOW_FLAT_DISCOUNT",
      "PRIV_ALLOW_INDIVIDUAL_DISCOUNT",
      "PRIV_ALLOW_FOC",

      "PRIV_VIEW_SALES_RETURN",
      "PRIV_MODIFY_SALES_RETURN",

      "PRIV_VIEW_ALL_INVENTORIES",
      "PRIV_MODIFY_ALL_INVENTORIES",
      "PRIV_TRANSFER_ALL_INVENTORIES",
      "PRIV_REPORT_DAMAGES_IN_ALL_INVENTORIES",

      "PRIV_VIEW_ALL_OUTLETS",
      "PRIV_MODIFY_ALL_OUTLETS",

      "PRIV_VIEW_ALL_WAREHOUSES",
      "PRIV_MODIFY_ALL_WAREHOUSES",

      "PRIV_VIEW_ORGANIZATION_STATISTICS",
      "PRIV_MODIFY_ORGANIZATION",

      "PRIV_VIEW_CUSTOMER",
      "PRIV_ADD_CUSTOMER_DURING_SALES",
      "PRIV_MODIFY_CUSTOMER",
      "PRIV_MANAGE_CUSTOMER_DEBT"
    ];

    let employeeDefaultPrivilegeList = [
      "PRIV_VIEW_USERS",
      // "PRIV_MODIFY_USERS",
      // "PRIV_ADD_USER",
      // "PRIV_MAKE_USER_AN_OWNER",
      // "PRIV_MODIFY_USER_PRIVILEGES",

      "PRIV_ACCESS_POS",
      "PRIV_VIEW_SALES",
      "PRIV_MODIFY_SALES",
      "PRIV_ALLOW_FLAT_DISCOUNT",
      "PRIV_ALLOW_INDIVIDUAL_DISCOUNT",
      "PRIV_ALLOW_FOC",

      "PRIV_VIEW_SALES_RETURN",
      "PRIV_MODIFY_SALES_RETURN",

      "PRIV_VIEW_ALL_INVENTORIES",
      // "PRIV_MODIFY_ALL_INVENTORIES",
      "PRIV_TRANSFER_ALL_INVENTORIES",
      "PRIV_REPORT_DAMAGES_IN_ALL_INVENTORIES",

      "PRIV_VIEW_ALL_OUTLETS",
      // "PRIV_MODIFY_ALL_OUTLETS",

      "PRIV_VIEW_ALL_WAREHOUSES",
      // "PRIV_MODIFY_ALL_WAREHOUSES",

      "PRIV_VIEW_ORGANIZATION_STATISTICS",
      // "PRIV_MODIFY_ORGANIZATION",

      "PRIV_VIEW_CUSTOMER",
      "PRIV_ADD_CUSTOMER_DURING_SALES",
      "PRIV_MODIFY_CUSTOMER",
      "PRIV_MANAGE_CUSTOMER_DEBT"
    ];

    let privileges = {};
    privilegeList.forEach(privilege => {
      if (isForAnOwner) {
        privileges[privilege] = true;
      } else {
        if (employeeDefaultPrivilegeList.indexOf(privilege) > -1) {
          privileges[privilege] = true;
        } else {
          privileges[privilege] = false;
        }
      }
    });
    return privileges;
  }

  employNewEmployeeAsOwner({ userId, organizationId }, cbfn) {
    let user = {
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      userId,
      organizationId,
      designation: 'Owner',
      role: 'owner',
      companyProvidedId: '',
      privileges: this.__makePrivilegeModel(true),
      isActive: true
    }
    this._insert(user, (err, id) => {
      return cbfn(err, id);
    })
  }

  getEmploymentOfUserInOrganization({ userId, organizationId }, cbfn) {
    this._findOne({ userId, organizationId }, cbfn);
  }

  getEmploymentsOfUser({ userId }, cbfn) {
    this._find({ userId }, cbfn);
  }

  getEmploymentById({ employmentId }, cbfn) {
    this._findOne({ id: employmentId }, cbfn);
  }

  update({ employmentId }, { isActive, role, designation, companyProvidedId, privileges }, cbfn) {
    let modifications = {
      $set: {
        isActive, role, designation, companyProvidedId, privileges
      }
    }
    this._update({ id: employmentId }, modifications, cbfn);
  }

  fire({ employmentId }, cbfn) {
    let modifications = {
      $set: {
        isActive: false
      }
    }
    this._update({ id: employmentId }, modifications, cbfn);
  }

  listByOrganizationId({ organizationId }, cbfn) {
    this._find({ organizationId, isActive: true }, cbfn);
  }

  hireExistingUser({ userId, organizationId, role, designation, companyProvidedId, privileges }, cbfn) {
    let user = {
      createdDatetimeStamp: (new Date).getTime(),
      lastModifiedDatetimeStamp: (new Date).getTime(),
      userId,
      organizationId,
      designation,
      role,
      companyProvidedId,
      privileges,
      isActive: true
    }
    this._insert(user, (err, id) => {
      return cbfn(err, id);
    })
  }

}
