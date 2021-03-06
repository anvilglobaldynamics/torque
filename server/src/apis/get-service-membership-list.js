
const { Api } = require('./../api-base');
const Joi = require('joi');
const { throwOnFalsy, throwOnTruthy, CodedError } = require('./../utils/coded-error');
const { extract } = require('./../utils/extract');

exports.GetServiceMembershipListApi = class extends Api {

  get autoValidates() { return true; }

  get requiresAuthentication() { return true; }

  get autoPaginates() { return ['serviceMembershipList']; }

  get requestSchema() {
    return Joi.object().keys({
      organizationId: Joi.number().max(999999999999999).required(),
      serviceBlueprintId: Joi.number().max(999999999999999).allow(null).required(),
      outletId: Joi.number().max(999999999999999).allow(null).required(),
      customerId: Joi.number().max(999999999999999).allow(null).required(),

      shouldFilterByServiceBlueprint: Joi.boolean().required(),
      shouldFilterByOutlet: Joi.boolean().required(),
      shouldFilterByCustomer: Joi.boolean().required(),

      fromDate: Joi.number().max(999999999999999).required(),
      toDate: Joi.number().max(999999999999999).required()
    });
  }

  get accessControl() {
    return [{
      organizationBy: "organizationId",
      privilegeList: [
        "PRIV_VIEW_ALL_SERVICE_MEMBERSHIPS"
      ],
      moduleList: [
        "MOD_SERVICE",
      ]
    }];
  }

  _getExtendedToDate(toDate) {
    toDate = new Date(toDate);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate = toDate.getTime();
    return toDate;
  }

  async _verifyOutletIfNeeded({ outletId, shouldFilterByOutlet }) {
    if (shouldFilterByOutlet) {
      let doc = await this.database.outlet.findById({ id: outletId });
      throwOnFalsy(doc, "OUTLET_INVALID", "Outlet not found.");
    }
  }

  async _verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer }) {
    if (shouldFilterByCustomer) {
      let doc = await this.database.customer.findById({ id: customerId });
      throwOnFalsy(doc, "CUSTOMER_INVALID", "Customer not found.");
    }
  }

  async _verifyServiceBlueprintIfNeeded({ serviceBlueprintId, shouldFilterByServiceBlueprint }) {
    if (shouldFilterByServiceBlueprint) {
      let doc = await this.database.serviceBlueprint.findById({ id: serviceBlueprintId });
      throwOnFalsy(doc, "SERVICE_BLUEPRINT_INVALID", "Service blueprint not found.");
    }
  }

  async _combineCustomerData({ serviceMembershipList }) {
    for (let i = 0; i < serviceMembershipList.length; i++) {
      let { fullName, phone } = await this.database.customer.findById({ id: serviceMembershipList[i].customerId });
      serviceMembershipList[i].customerDetails = { fullName, phone };
    }
  }

  async _combineAssignedEmployeeData({ serviceMembershipList }) {
    for (let i = 0; i < serviceMembershipList.length; i++) {
      if (serviceMembershipList[i].assignedEmploymentId) {
        let employee = await this.database.employment.findById({ id: serviceMembershipList[i].assignedEmploymentId });
        throwOnFalsy(employee, "EMPLOYEE_INVALID", "Employee data unavailable / invalid.");
        let user = await this.database.user.findById({ id: employee.userId });
        throwOnFalsy(user, "USER_INVALID", "User data unavailable / invalid.");
        serviceMembershipList[i].assignedEmployeeDetails = { fullName: user.fullName, phone: user.phone };
      } else {
        serviceMembershipList[i].assignedEmployeeDetails = null;
      }
    }
  }

  async _findServiceMembershipList({ serviceBlueprintId, outletId, customerId, shouldFilterByServiceBlueprint, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate, organizationId }) {
    // console.log({ serviceBlueprintId, outletId, customerId, shouldFilterByServiceBlueprint, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate, organizationId })

    let aggregateQuery = [
      {
        $lookup: {
          from: 'service',
          localField: 'serviceId',
          foreignField: 'id',
          as: 'serviceDetailsArray'
        },
      },
      {
        $lookup: {
          from: 'service-blueprint',
          localField: 'serviceDetailsArray.0.serviceBlueprintId',
          foreignField: 'id',
          as: 'serviceBlueprintDetailsArray'
        },
      }
    ];

    // NOTE: handling - organizationId, outletId, shouldFilterByOutlet
    {
      let query;
      if (shouldFilterByOutlet) {
        query = { "salesDetailsArray.outletId": outletId };
      } else {
        let outletIdList = (await this.database.outlet.listByOrganizationId({ organizationId })).map(outlet => outlet.id);
        query = { "salesDetailsArray.outletId": { $in: outletIdList } };
      }
      aggregateQuery = aggregateQuery.concat([
        {
          $lookup: {
            from: 'sales',
            localField: 'salesId',
            foreignField: 'id',
            as: 'salesDetailsArray'
          },
        },
        { "$match": query },
      ]);
    }

    // NOTE: handling - customerId, shouldFilterByCustomer
    {
      if (shouldFilterByCustomer) {
        aggregateQuery = aggregateQuery.concat([
          { "$match": { "customerId": customerId } },
        ]);
      }
    }

    // NOTE: handling - serviceBlueprintId, shouldFilterByServiceBlueprint
    {
      if (shouldFilterByServiceBlueprint) {
        aggregateQuery = aggregateQuery.concat([
          { "$match": { "serviceDetailsArray.serviceBlueprintId": serviceBlueprintId } },
        ]);
      }
    }

    // NOTE: handling - fromDate, toDate
    aggregateQuery = aggregateQuery.concat([
      {
        "$match": {
          "expiringDatetimeStamp": {
            $gte: fromDate,
            $lte: toDate
          }
        }
      },
    ]);

    // console.log('aggregateQuery', JSON.stringify(aggregateQuery, null, 2));
    let serviceMembershipList = await this.database.engine.getDatabaseHandle().collection('service-membership').aggregate(aggregateQuery).toArray();
    // console.log('serviceMembershipList', JSON.stringify(serviceMembershipList, null, 2));

    // NOTE: Cleaning up intermediary variables
    serviceMembershipList.forEach(serviceMembership => {
      if ('salesDetailsArray' in serviceMembership) {
        delete serviceMembership['salesDetailsArray'];
      }
      if ('serviceDetailsArray' in serviceMembership) {
        delete serviceMembership['serviceDetailsArray'];
      }
      if ('serviceBlueprintDetailsArray' in serviceMembership) {
        serviceMembership.serviceBlueprintDetails = {
          name: serviceMembership.serviceBlueprintDetailsArray[0].name
        };
        delete serviceMembership['serviceBlueprintDetailsArray'];
      }

    });

    return serviceMembershipList;
  }

  // NOTE: This method was written as an alternative to _findServiceMembershipList.
  // Currently letting it remain here in case the mongodb complex queries don't work for some reason.
  async _findServiceMembershipListNaive({ serviceBlueprintId, outletId, customerId, shouldFilterByServiceBlueprint, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate, organizationId }) {

    let outletIdList;
    if (shouldFilterByOutlet) {
      outletIdList = [outletId];
    } else {
      outletIdList = (await this.database.outlet.listByOrganizationId({ organizationId })).map(outlet => outlet.id);
    }

    let serviceMembershipList = await this.database.serviceMembership._find({
      "expiringDatetimeStamp": {
        $gte: fromDate,
        $lte: toDate
      }
    });

    // console.log('length: After time query', serviceMembershipList.length)
    serviceMembershipList.forEach(serviceMembership => console.log(new Date(serviceMembership.expiringDatetimeStamp)))

    for (let serviceMembership of serviceMembershipList) {
      serviceMembership.salesDetails = await this.database.sales.findById({ id: serviceMembership.salesId });
      serviceMembership.serviceDetails = await this.database.service.findById({ id: serviceMembership.serviceId });
    }
    if (shouldFilterByServiceBlueprint) {
      serviceMembershipList = serviceMembershipList.filter(serviceMembership => {
        return serviceMembership.serviceDetails.serviceBlueprintId === serviceBlueprintId;
      });
    }
    if (shouldFilterByCustomer) {
      serviceMembershipList = serviceMembershipList.filter(serviceMembership => {
        return serviceMembership.customerId === customerId;
      });
    }

    serviceMembershipList = serviceMembershipList.filter(serviceMembership => {
      // console.log(outletIdList, serviceMembership.salesDetails.outletId, outletIdList.includes(serviceMembership.salesDetails.outletId))
      return outletIdList.includes(serviceMembership.salesDetails.outletId);
    });

    // console.log('serviceMembershipList', JSON.stringify(serviceMembershipList, null, 2));

    // NOTE: Cleaning up intermediary variables
    serviceMembershipList.forEach(serviceMembership => {
      if ('salesDetails' in serviceMembership) {
        delete serviceMembership['salesDetails'];
      }
      if ('serviceDetails' in serviceMembership) {
        delete serviceMembership['serviceDetails'];
      }
    });

    return serviceMembershipList;
  }

  async handle({ body }) {
    let { serviceBlueprintId, outletId, customerId, shouldFilterByServiceBlueprint, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate, organizationId } = body;

    toDate = this._getExtendedToDate(toDate);

    await this._verifyOutletIfNeeded({ outletId, shouldFilterByOutlet });
    await this._verifyCustomerIfNeeded({ customerId, shouldFilterByCustomer });
    await this._verifyServiceBlueprintIfNeeded({ serviceBlueprintId, shouldFilterByServiceBlueprint });

    let serviceMembershipList = await this._findServiceMembershipList({ serviceBlueprintId, outletId, customerId, shouldFilterByServiceBlueprint, shouldFilterByOutlet, shouldFilterByCustomer, fromDate, toDate, organizationId });

    await this._combineCustomerData({ serviceMembershipList });
    await this._combineAssignedEmployeeData({ serviceMembershipList });

    return { serviceMembershipList };
  }

}