let { callApi } = require('./utils');
let { Program } = require('./../src/index');
let Joi = require('joi');

let mainProgram = new Program({ allowUnsafeApis: false, muteLogger: true });
let hasStarted = false;
let pendingTerminationRequest = false;

let testStartDatetimeStamp = (new Date).getTime();

exports.promisifyApiCall = (context, method, ...args) => {
  return new Promise((success, fail) => {
    args.push((res) => {
      if (res.hasError) {
        return fail(res);
      }
      return success(res);
    })
    method.apply(context, args);
  });
}

exports.delay = (after, cbfn) => setTimeout(cbfn, after);

// ===================================== Commons

exports.rnd = (prefix, len = 14) => {
  return prefix + String((new Date).getTime()).split('').reverse().slice(0, len).join('');
}

exports.generateInvalidId = (min = 0, max = 999999999999999) => -1 * (Math.floor(Math.random() * (max - min)) + min);

// ===================================== Server

exports.getDatabase = () => { return mainProgram.exposeLegacyDatabaseForTesting(); }

exports.getAsyncDatabase = () => { return mainProgram.exposeDatabaseForTesting(); }

exports.initializeServer = async (callback) => {
  pendingTerminationRequest = false;
  if (hasStarted) {
    setTimeout(_ => {
      callback();
    }, 10);
    return;
  }
  await mainProgram.initiateServer();
  hasStarted = true;
  setTimeout(_ => {
    callback();
  }, 10);
}

exports.terminateServer = (callback) => {
  pendingTerminationRequest = true;
  setTimeout(_ => {
    if (pendingTerminationRequest) {
      let now = (new Date).getTime();
      let diff = (now - testStartDatetimeStamp) / 1000;
      console.log(`Test Ran for ${diff} seconds`);
      mainProgram.terminateServer();
    }
  }, 300);
  callback();
}

// ===================================== User

exports.registerUser = (data, callback) => {
  data.hasAgreedToToc = true;
  if (!('countryCode' in data)) data.countryCode = '+880'
  callApi('api/user-register', {
    json: data
  }, (err, response, body) => {
    setTimeout(_ => {
      callback(body);
    }, 10);
  })
}

exports.loginUser = (data, callback) => {
  if (!('countryCode' in data)) data.countryCode = '+880'
  callApi('api/user-login', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

exports.loginOut = (data, callback) => {
  callApi('api/user-logout', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

exports.editUser = (data, callback) => {
  callApi('api/user-edit-profile', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

// ===================================== Organization

exports.addOrganization = (data, callback) => {
  callApi('api/add-organization', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

// ===================================== Payment Method

exports.getPaymentMethodCash = (data, callback) => {
  callApi('api/get-payment-method-list', {
    json: data
  }, (err, response, body) => {
    let { paymentMethodList } = body;
    let paymentMethodCash = paymentMethodList.find(pm => pm.monetaryAccountDetails.codeName === 'CASH');
    callback({ paymentMethodCash });
  })
}

// ===================================== Warehouse

exports.addWarehouse = (data, callback) => {
  callApi('api/add-warehouse', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

exports.getWarehouse = (data, callback) => {
  callApi('api/get-warehouse', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

// ===================================== Outlet

exports.addOutlet = (data, callback) => {
  callApi('api/add-outlet', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

exports.getOutlet = (data, callback) => {
  callApi('api/get-outlet', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

// ===================================== Product Category

exports.addProductCategory = (data, callback) => {
  callApi('api/add-product-category', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

// ===================================== Product Blueprint

exports.addProductBlueprint = (data, callback) => {
  callApi('api/add-product-blueprint', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

// ===================================== Service Blueprint

exports.addServiceBlueprint = (data, callback) => {
  callApi('api/add-Service-blueprint', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

// ===================================== Service 

exports.getActiveServiceList = (data, callback) => {
  callApi('api/get-active-service-list', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

// ===================================== Customer

exports.addCustomer = (data, callback) => {
  callApi('api/add-customer', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

exports.getCustomer = (data, callback) => {
  callApi('api/get-customer', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

// ===================================== Inventory

exports.addProductToInventory = (data, callback) => {
  callApi('api/add-product-to-inventory', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

exports.getAggregatedInventoryDetails = (data, callback) => {
  callApi('api/get-aggregated-inventory-details', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

// ===================================== Sales

exports.addSales = (data, callback) => {
  callApi('api/add-sales', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

exports.getSales = (data, callback) => {
  callApi('api/get-sales', {
    json: data
  }, (err, response, body) => {
    callback(body);
  })
}

// ===================================== Validation

// --- Response Validation Start

exports.validateAddCustomerApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    customerId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetCustomerSummaryListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    customerList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetCustomerApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    customer: Joi.object().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetDashboardSummaryApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    metrics: Joi.object().keys({
      totalNumberOfSalesToday: Joi.number().required(),
      totalAmountSoldToday: Joi.number().required(),
      totalNumberOfSalesThisMonth: Joi.number().required(),
      totalAmountSoldThisMonth: Joi.number().required()
    }),
    organizationPackageDetails: Joi.object().allow(null).keys({
      packageActivation: Joi.object().required(),
      packageDetail: Joi.object().required()
    }),
    usageFlags: Joi.object().keys({
      hasAnyOutlet: Joi.boolean().required(),
      outletIdList: Joi.array().required(),
      defaultFirstInventoryId: Joi.number().allow(null).required(),
      hasAnyProductBlueprint: Joi.boolean().required(),
      hasAnyVendor: Joi.boolean().required(),
      hasAnyProductAcquisition: Joi.boolean().required(),
      hasAnyServiceBlueprint: Joi.boolean().required(),
      hasUpdatedFirstOutlet: Joi.boolean().required(),
      hasAnySales: Joi.boolean().required()
    }),
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateHireUserAsEmployeeApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    employmentId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateFindUserApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    user: Joi.object().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAddNewEmployeeApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    userId: Joi.number().required(),
    employmentId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetEmployeeListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    employeeList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetEmployeeApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    employee: Joi.object().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetInventoryListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    inventoryList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAddProductToInventoryApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.array().required().equal('success'),
    insertedProductList: Joi.array().required().items(
      Joi.object().keys({
        productId: Joi.number().required(),
        count: Joi.number().required(),
      })
    )
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetProductAcquisitionListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    productAcquisitionList: Joi.array().required().items({

      id: Joi.number().required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),
      createdByUserId: Joi.number().max(999999999999999).required(),

      productAcquisitionNumber: Joi.number().max(999999999999999).required(),

      acquiredDatetimeStamp: Joi.number().max(999999999999999).required(),
      inventoryId: Joi.number().max(999999999999999).required(),
      vendorId: Joi.number().max(999999999999999).allow(null).required(),
      organizationId: Joi.number().max(999999999999999).required(),

      productList: Joi.array().min(1).items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          product: Joi.object().required(), // willingly not expanded
          productBlueprint: Joi.object().required(), // willingly not expanded
          count: Joi.number().max(999999999999999).required()
        })
      ),

      createdByUser: Joi.object().required(), // willingly not expanded
      inventory: Joi.object().required(), // willingly not expanded
      vendor: Joi.object().allow(null).required() // willingly not expanded    

    })

  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetProductTransferListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    productTransferList: Joi.array().required().items({

      id: Joi.number().required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),
      createdByUserId: Joi.number().max(999999999999999).required(),

      productTransferNumber: Joi.number().max(999999999999999).required(),

      transferredDatetimeStamp: Joi.number().max(999999999999999).required(),
      fromInventoryId: Joi.number().max(999999999999999).required(),
      toInventoryId: Joi.number().max(999999999999999).required(),
      vendorId: Joi.number().max(999999999999999).allow(null).required(),
      organizationId: Joi.number().max(999999999999999).required(),

      isWithinSameInventoryContainer: Joi.boolean().required(),

      productList: Joi.array().min(1).items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          product: Joi.object().required(), // willingly not expanded
          productBlueprint: Joi.object().required(), // willingly not expanded
          count: Joi.number().max(999999999999999).required()
        })
      ),

      createdByUser: Joi.object().required(), // willingly not expanded
      fromInventory: Joi.object().required(), // willingly not expanded
      toInventory: Joi.object().required(), // willingly not expanded
      vendor: Joi.object().allow(null).required() // willingly not expanded

    })

  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateReportProductSalesDetailsApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    productSalesSummaryList: Joi.array().required().items({
      productId: Joi.number().required(),
      productBlueprintId: Joi.number().required(),
      sumCount: Joi.number().required(),
      sumSalePrice: Joi.number().required(),
      name: Joi.string().required(),
      unit: Joi.string().required()
    })
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetAggregatedInventoryDetailsApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    inventoryDetails: Joi.object().required(),
    inventoryContainerDetails: Joi.object().required(),

    aggregatedProductList: Joi.array().required().items({
      productId: Joi.number().required(),
      count: Joi.number().required(),

      product: Joi.object().keys({
        id: Joi.number().required(),

        createdDatetimeStamp: Joi.number().max(999999999999999).required(),
        lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

        productBlueprintId: Joi.number().required(),
        purchasePrice: Joi.number().required(),
        salePrice: Joi.number().required(),

        productBlueprint: Joi.object().keys({
          id: Joi.number().required(),
          createdDatetimeStamp: Joi.number().max(999999999999999).required(),
          lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
          name: Joi.string().required(),
          organizationId: Joi.number().required(),
          unit: Joi.string().required(),
          identifierCode: Joi.string().max(64).allow('').required(),
          defaultPurchasePrice: Joi.number().required(),
          defaultVat: Joi.number().required(),
          defaultSalePrice: Joi.number().required(),
          productCategoryIdList: Joi.array().items(Joi.number()).required(),
          isDeleted: Joi.boolean().required(),
          isReturnable: Joi.boolean().required()
        })
      })
    })
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetProductApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    product: Joi.object().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateReportInventoryDetailsApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),

    aggregatedInventoryDetailsList: Joi.array().items(
      Joi.object().keys({

        inventoryDetails: Joi.object().required(),
        inventoryContainerDetails: Joi.object().required(),

        aggregatedProductList: Joi.array().required().items({
          productId: Joi.number().required(),
          count: Joi.number().required(),

          product: Joi.object().keys({
            id: Joi.number().required(),

            createdDatetimeStamp: Joi.number().max(999999999999999).required(),
            lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

            productBlueprintId: Joi.number().required(),
            purchasePrice: Joi.number().required(),
            salePrice: Joi.number().required(),

            productBlueprint: Joi.object().keys({
              id: Joi.number().required(),
              createdDatetimeStamp: Joi.number().max(999999999999999).required(),
              lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
              name: Joi.string().required(),
              organizationId: Joi.number().required(),
              unit: Joi.string().required(),
              identifierCode: Joi.string().max(64).allow('').required(),
              defaultPurchasePrice: Joi.number().required(),
              defaultVat: Joi.number().required(),
              defaultSalePrice: Joi.number().required(),
              isDeleted: Joi.boolean().required(),
              productCategoryIdList: Joi.array().items(Joi.number()).required(),
              isReturnable: Joi.boolean().required()
            })
          })
        })

      })
    )
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAddOrganizationApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    organizationId: Joi.number().required(),
    employmentId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetOrganizationListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    organizationList: Joi.array().required().items({
      id: Joi.number().required(),
      name: Joi.string().required(),
      primaryBusinessAddress: Joi.string().required(),
      phone: Joi.string().required(),
      email: Joi.string().email().required(),
      activeModuleCodeList: Joi.array().items(
        Joi.string().required()
      ).required(),
      employment: Joi.object().keys({
        designation: Joi.string().required(),
        role: Joi.string().required(),
        companyProvidedId: Joi.string().allow('').required(),
        isActive: Joi.boolean().required(),
        privileges: Joi.object().required()
      }),
      settings: Joi.object().keys({
        monetaryUnit: Joi.string().min(1).max(3).required(),
        vatRule: Joi.string().valid('vat-before-discount', 'vat-after-discount').required(),
        decimalFormatPreset: Joi.string().valid('XX,XX,XXX.XX', 'X,XXX,XXX.XX', 'X XXX XXX,XX', 'X.XXX.XXX,XX').required(),
        receiptText1: Joi.string().min(0).max(64).allow('').required(),
        receiptText2: Joi.string().min(0).max(64).allow('').required(),
        logoImageId: Joi.number().max(999999999999999).allow(null).required(),
      })
    })
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAddOutletApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    outletId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetOutletListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    outletList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetOutletCategoryListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    categoryList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetOutletApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),

    outlet: Joi.object().keys({
      id: Joi.number().required(),

      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      name: Joi.string().required(),
      organizationId: Joi.number().required(),
      physicalAddress: Joi.string().required(),
      contactPersonName: Joi.string().required(),
      phone: Joi.string().required(),

      location: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required(),
      categoryCode: Joi.string().required(),

      isDeleted: Joi.boolean().required()
    }),

    defaultInventory: Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      id: Joi.number().required(),
      name: Joi.string().required(),
    }),

    returnedInventory: Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      id: Joi.number().required(),
      name: Joi.string().required(),
    }),

    damagedInventory: Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      id: Joi.number().required(),
      name: Joi.string().required(),
    })
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetWarehouseApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),

    warehouse: Joi.object().keys({
      id: Joi.number().required(),

      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      name: Joi.string().required(),
      organizationId: Joi.number().required(),
      physicalAddress: Joi.string().required(),
      contactPersonName: Joi.string().required(),
      phone: Joi.string().required(),
      isDeleted: Joi.boolean().required()
    }),

    defaultInventory: Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      id: Joi.number().required(),
      name: Joi.string().required(),
    }),

    returnedInventory: Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      id: Joi.number().required(),
      name: Joi.string().required(),
    }),

    damagedInventory: Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      id: Joi.number().required(),
      name: Joi.string().required(),
    })
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAddVendorApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    vendorId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAddProductCategoryApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    productCategoryId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAddProductBlueprintApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    productBlueprintId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateBulkImportProductBlueprintsApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    ignoredRowList: Joi.array().required().allow([]),
    successfulCount: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetProductCategoryListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    productCategoryList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetVendorListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    vendorList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetProductBlueprintListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    productBlueprintList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetServiceBlueprintListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    serviceBlueprintList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetActiveServiceListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    serviceList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateLiteAddSalesApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    receiptToken: Joi.string().length(6).required(),
    sentVia: Joi.string().valid('none', 'print', 'email', 'sms', 'own-sms').required(),
    productBlueprintIdList: Joi.array().allow([]).min(0).items(
      Joi.object().keys({
        productBlueprintId: Joi.number().max(999999999999999)
      })
    ),
    salesId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAddSalesApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    receiptToken: Joi.string().length(6).required(),
    sentVia: Joi.string().valid('none', 'print', 'email', 'sms', 'own-sms').required(),
    salesId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetSalesApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    sales: Joi.object().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAddSalesReturnApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    salesReturnId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetSalesListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    salesList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetServiceMembershipListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    serviceMembershipList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetSalesReturnApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    salesReturn: Joi.object().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetSalesReturnListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    salesReturnList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAddWarehouseApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    warehouseId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetWarehouseListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    warehouseList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAddServiceBlueprintApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    serviceBlueprintId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

// Admin

exports.validateAdminFindOrganizationApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    organization: Joi.object().required(),
    employeeList: Joi.any().required(),
    outletList: Joi.any().required(),
    warehouseList: Joi.any().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAdminAssignPackageToOrganizationApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    packageActivationId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateListOrganizationPackagesApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    packageActivationList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAdminGetModuleListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    moduleList: Joi.array().items(Joi.object().keys({
      code: Joi.string().required(),
      name: Joi.string().required()
    })).required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateShopLocateNearbyOutletsApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    outletList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateOutletReturnedByShopLocateNearbyOutletsApi = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),
    name: Joi.string().min(1).max(64).required(),
    organizationName: Joi.string().min(1).max(64).required(),
    categoryCode: Joi.string().required(),
    location: Joi.object().keys({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}


exports.validateShopGetOutletDetailsApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    outletDeatils: Joi.object().keys({
      name: Joi.string().min(1).max(64).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      categoryCode: Joi.string().required()
    }).required(),
    organizationDetails: Joi.object().keys({
      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      email: Joi.string().email().min(3).max(30).required()
    }).required(),
    otherOutletList: Joi.array().items(
      Joi.object().keys({
        name: Joi.string().min(1).max(64).required(),
        categoryCode: Joi.string().required(),
        id: Joi.number().max(999999999999999).required()
      })
    ),
    outletProductList: Joi.array().items(
      Joi.object().keys({
        productBlueprintName: Joi.string().min(1).max(64).required(),
        salePrice: Joi.number().max(999999999999999).required()
      })
    ),
    outletServiceList: Joi.array().items(
      Joi.object().keys({
        serviceBlueprintName: Joi.string().min(1).max(64).required(),
        salePrice: Joi.number().min(0).max(999999999999999).required()
      })
    )
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}


exports.validateAdminListOrganizationModulesApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    moduleActivationList: Joi.array().items(Joi.object().keys({
      id: Joi.number().optional(),

      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      deactivatedDatetimeStamp: Joi.number().max(999999999999999).allow(null).required(),
      moduleCode: Joi.string().required(),
      organizationId: Joi.number().max(999999999999999).required(),
      createdByAdminName: Joi.string().min(1).max(64).required(),
      paymentReference: Joi.string().min(4).max(128).required(),
      isDeactivated: Joi.boolean().required()
    })).required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

// Generic

exports.validateGenericApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success')
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGenericApiFailureResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(true),
    error: Joi.object().required().keys({
      code: Joi.string().required(),
      message: Joi.string().required(),
      // check if stack and details are required 
      stack: Joi.required(),
      details: Joi.required(),
      rowNumber: Joi.number().optional(),
      cellNumber: Joi.number().optional()
    })
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

// --- Response Validation End

exports.validateCustomerSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    isDeleted: Joi.boolean().required(),

    fullName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
    email: Joi.string().email().min(3).max(30).allow(null).required(),
    address: Joi.string().min(1).max(128).allow('').required(),

    organizationId: Joi.number().max(999999999999999).required(),
    changeWalletBalance: Joi.number().max(999999999999999).required(),

    withdrawalHistory: Joi.array().items(
      Joi.object().keys({
        creditedDatetimeStamp: Joi.number().max(999999999999999).required(),
        byUserId: Joi.number().max(999999999999999).required(),
        amount: Joi.number().max(999999999999999).required()
      })
    )

  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateOutletSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    name: Joi.string().min(1).max(64).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    physicalAddress: Joi.string().min(1).max(128).required(),
    contactPersonName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),

    location: Joi.object().keys({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required(),
    categoryCode: Joi.string().required(),

    isDeleted: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validatePackageActivationSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    packageCode: Joi.string().required(),
    organizationId: Joi.number().max(999999999999999).required(),
    createdByAdminName: Joi.string().min(1).max(64).required(),
    paymentReference: Joi.string().min(4).max(128).required(),
    isDiscarded: Joi.boolean().required(),

    packageDetail: Joi.object().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateResponseOrganizationSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),
    name: Joi.string().min(1).max(64).required(),
    primaryBusinessAddress: Joi.string().min(1).max(128).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
    email: Joi.string().email().min(3).max(30).required(),
    activeModuleCodeList: Joi.array().items(
      Joi.string().required()
    ).required(),
    employment: Joi.object().keys({
      designation: Joi.string().max(64).required(),
      role: Joi.string().max(64).required(),
      companyProvidedId: Joi.string().allow('').required(),
      isActive: Joi.boolean().required(),
      privileges: Joi.object()
    }),
    settings: Joi.object().keys({
      monetaryUnit: Joi.string().min(1).max(3).required(),
      vatRule: Joi.string().valid('vat-before-discount', 'vat-after-discount').required(),
      decimalFormatPreset: Joi.string().valid('XX,XX,XXX.XX', 'X,XXX,XXX.XX', 'X XXX XXX,XX', 'X.XXX.XXX,XX').required(),
      receiptText1: Joi.string().min(0).max(64).allow('').required(),
      receiptText2: Joi.string().min(0).max(64).allow('').required(),
      logoImageId: Joi.number().max(999999999999999).allow(null).required(),
    })
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateOrganizationSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    createdByUserId: Joi.number().max(999999999999999).required(),
    name: Joi.string().min(1).max(64).required(),
    primaryBusinessAddress: Joi.string().min(1).max(128).required(),
    activeModuleCodeList: Joi.array().items(
      Joi.string().required()
    ).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
    countryCode: Joi.string().regex(/^[a-z0-9\+]*$/i).min(2).max(4).required(),
    email: Joi.string().email().min(3).max(30).required(),
    packageActivationId: Joi.number().max(999999999999999).allow(null).required(),
    isDeleted: Joi.boolean().required(),
    activeModuleCodeList: Joi.array().items(
      Joi.string().required()
    ).required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateWarehouseSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    name: Joi.string().min(1).max(64).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    physicalAddress: Joi.string().min(1).max(128).required(),
    contactPersonName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),

    isDeleted: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateProductCategorySchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    name: Joi.string().min(1).max(32).required(),
    colorCode: Joi.string().length(6).required(),
    organizationId: Joi.number().max(999999999999999).required(),

    isDeleted: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateVendorSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    name: Joi.string().min(1).max(64).required(),
    contactPersonName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
    physicalAddress: Joi.string().min(1).max(128).required(),

    organizationId: Joi.number().max(999999999999999).required(),
    isDeleted: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateProductBlueprintSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    name: Joi.string().min(1).max(64).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    unit: Joi.string().max(64).required(),
    identifierCode: Joi.string().max(64).allow('').required(),
    defaultPurchasePrice: Joi.number().max(999999999999999).required(),
    defaultVat: Joi.number().max(999999999999999).required(),
    defaultSalePrice: Joi.number().max(999999999999999).required(),

    isDeleted: Joi.boolean().required(),
    productCategoryIdList: Joi.array().items(Joi.number()).required(),
    isReturnable: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateServiceBlueprintSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    organizationId: Joi.number().max(999999999999999).required(),
    name: Joi.string().min(1).max(64).required(),

    defaultVat: Joi.number().min(0).max(999999999999999).required(),
    defaultSalePrice: Joi.number().min(0).max(999999999999999).required(),

    isLongstanding: Joi.boolean().required(),
    serviceDuration: Joi.object().allow(null).required().keys({
      months: Joi.number().min(0).max(999999999999999).required(),
      days: Joi.number().min(0).max(999999999999999).required(),
    }),

    isEmployeeAssignable: Joi.boolean().required(),
    isCustomerRequired: Joi.boolean().required(),
    isRefundable: Joi.boolean().required(),
    isDeleted: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateServiceSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    createdByUserId: Joi.number().max(999999999999999).required(),

    serviceBlueprintId: Joi.number().max(999999999999999).required(),
    outletId: Joi.number().max(999999999999999).required(),

    serviceBlueprint: Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      id: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),

      defaultVat: Joi.number().min(0).max(999999999999999).required(),
      defaultSalePrice: Joi.number().min(0).max(999999999999999).required(),

      isLongstanding: Joi.boolean().required(),
      serviceDuration: Joi.object().allow(null).required().keys({
        months: Joi.number().min(0).max(999999999999999).required(),
        days: Joi.number().min(0).max(999999999999999).required(),
      }),

      isEmployeeAssignable: Joi.boolean().required(),
      isCustomerRequired: Joi.boolean().required(),
      isRefundable: Joi.boolean().required(),
      isDeleted: Joi.boolean().required()
    }),

    salePrice: Joi.number().min(0).max(999999999999999).required(),
    isAvailable: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateProductSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    productBlueprintId: Joi.number().max(999999999999999).required(),
    purchasePrice: Joi.number().max(999999999999999).required(),
    salePrice: Joi.number().max(999999999999999).required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateInventorySchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    inventoryContainerType: Joi.string().valid('outlet', 'warehouse').required(),
    inventoryContainerName: Joi.string().required(),
    inventoryContainerId: Joi.number().max(999999999999999).required(),
    type: Joi.string().valid('default', 'returned', 'damaged').required(),
    name: Joi.string().min(1).max(64).required(),
    organizationId: Joi.number().max(999999999999999).required(),

    productList: Joi.array().items(
      Joi.object().keys({
        productId: Joi.number().max(999999999999999).required(),
        count: Joi.number().max(999999999999999).required()
      })
    ),

    isDeleted: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateEmbeddedInventorySchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    name: Joi.string().min(1).max(64).required(),
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateSalesSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    outletId: Joi.number().max(999999999999999).required(),
    customerId: Joi.number().max(999999999999999).allow(null).required(),

    salesNumber: Joi.number().max(999999999999999).required(),
    productsSelectedFromWarehouseId: Joi.number().max(999999999999999).allow(null).required(),

    productList: Joi.array().required().items(
      Joi.object().keys({
        productId: Joi.number().max(999999999999999).required(),
        productBlueprintId: Joi.number().max(999999999999999).required(),
        productBlueprintName: Joi.string().min(1).max(64).required(),
        productBlueprintUnit: Joi.string().max(64).required(),
        productBlueprintIsReturnable: Joi.boolean().required(),
        count: Joi.number().max(999999999999999).required(),
        returnedProductCount: Joi.number().max(999999999999999).required(),
        purchasePrice: Joi.number().max(999999999999999).required(),
        salePrice: Joi.number().max(999999999999999).required(),
        salePriceBeforeModification: Joi.number().max(999999999999999).required(),
        vatPercentage: Joi.number().max(999999999999999).required(),
      })
    ),

    serviceList: Joi.array().required().items(
      Joi.object().keys({
        serviceId: Joi.number().max(999999999999999).required(),
        serviceBlueprintId: Joi.number().max(999999999999999).required(),
        serviceBlueprintName: Joi.string().min(1).max(64).required(),
        serviceBlueprintIsLongstanding: Joi.boolean().required(),
        serviceBlueprintServiceDuration: Joi.object().allow(null).required().keys({
          months: Joi.number().min(0).max(999999999999999).required(),
          days: Joi.number().min(0).max(999999999999999).required(),
        }),
        serviceBlueprintIsRefundable: Joi.boolean().required(),
        salePrice: Joi.number().min(0).max(999999999999999).required(),
        vatPercentage: Joi.number().min(0).max(999999999999999).required(),
        assignedEmploymentId: Joi.number().max(999999999999999).allow(null).required()
      })
    ),

    payment: Joi.object().required().keys({
      totalAmount: Joi.number().max(999999999999999).required(),
      vatAmount: Joi.number().max(999999999999999).required(),
      discountPresetId: Joi.number().max(999999999999999).allow(null).required(),
      discountPresetName: Joi.string().min(0).max(64).allow('').required(),
      discountType: Joi.string().max(1024).required(),
      discountValue: Joi.number().max(999999999999999).required(),
      discountedAmount: Joi.number().max(999999999999999).required(),
      serviceChargeAmount: Joi.number().max(999999999999999).required(),
      totalBillBeforeRounding: Joi.number().max(999999999999999).required(),
      roundedByAmount: Joi.number().max(999999999999999).required(),
      totalBilled: Joi.number().max(999999999999999).required(),

      totalPaidAmount: Joi.number().max(999999999999999).required(),
      paymentList: Joi.array().min(1).items(
        Joi.object().keys({
          createdDatetimeStamp: Joi.number().max(999999999999999).required(),
          acceptedByUserId: Joi.number().max(999999999999999).required(),

          paidAmount: Joi.number().max(999999999999999).required(),
          changeAmount: Joi.number().max(999999999999999).required(),
          paymentMethodId: Joi.number().max(999999999999999).required(),

          paymentMethodDetails: Joi.object().keys({
            id: Joi.any(),
            createdDatetimeStamp: Joi.number().max(999999999999999).required(),
            lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

            name: Joi.string().min(1).max(32).required(),
            organizationId: Joi.number().max(999999999999999).required(),
            monetaryAccountId: Joi.number().max(999999999999999).required(),

            isDeleted: Joi.boolean().required()
          }).required(),

          wasChangeSavedInChangeWallet: Joi.boolean().required()
        })
      )
    }),

    assistedByEmployeeId: Joi.number().min(0).max(999999999999999).allow(null).required(),

    wasOfflineSale: Joi.boolean().required(),

    isModified: Joi.boolean().required(),
    isDeleted: Joi.boolean().required(),
    isDiscarded: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateSalesSchemaWhenListObj = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    outletId: Joi.number().max(999999999999999).required(),
    customerId: Joi.number().max(999999999999999).allow(null).required(),

    customer: Joi.object().keys({
      id: Joi.number().max(999999999999999).required(),

      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),

      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      changeWalletBalance: Joi.number().max(999999999999999).required(),
      email: Joi.string().email().min(3).max(30).allow(null).required(),
      address: Joi.string().min(1).max(128).allow('').required(),

      withdrawalHistory: Joi.array().items(
        Joi.object().keys({
          creditedDatetimeStamp: Joi.number().max(999999999999999).required(),
          byUserId: Joi.number().max(999999999999999).required(),
          amount: Joi.number().max(999999999999999).required()
        })
      )
    }),

    salesNumber: Joi.number().max(999999999999999).required(),
    productsSelectedFromWarehouseId: Joi.number().max(999999999999999).allow(null).required(),

    productList: Joi.array().required().items(
      Joi.object().keys({
        productId: Joi.number().max(999999999999999).required(),
        count: Joi.number().max(999999999999999).required(),
        purchasePrice: Joi.number().max(999999999999999).required(),
        salePrice: Joi.number().max(999999999999999).required(),
        salePriceBeforeModification: Joi.number().max(999999999999999).required(),
        vatPercentage: Joi.number().max(999999999999999).required(),

        product: Joi.object().keys({
          id: Joi.number().max(999999999999999).required(),

          createdDatetimeStamp: Joi.number().max(999999999999999).required(),
          lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

          productBlueprintId: Joi.number().max(999999999999999).required(),
          purchasePrice: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().max(999999999999999).required()
        }),

        productBlueprint: Joi.object().keys({
          id: Joi.number().max(999999999999999).required(),

          createdDatetimeStamp: Joi.number().max(999999999999999).required(),
          lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

          name: Joi.string().min(1).max(64).required(),
          organizationId: Joi.number().max(999999999999999).required(),
          unit: Joi.string().max(64).required(),
          identifierCode: Joi.string().max(64).allow('').required(),
          defaultPurchasePrice: Joi.number().max(999999999999999).required(),
          defaultVat: Joi.number().max(999999999999999).required(),
          defaultSalePrice: Joi.number().max(999999999999999).required(),

          isDeleted: Joi.boolean().required(),
          productCategoryIdList: Joi.array().items(Joi.number()).required(),
          isReturnable: Joi.boolean().required()

        })
      })
    ),

    serviceList: Joi.array().required().items(
      Joi.object().keys({
        serviceId: Joi.number().max(999999999999999).required(),
        salePrice: Joi.number().min(0).max(999999999999999).required(),
        vatPercentage: Joi.number().min(0).max(999999999999999).required(),
        assignedEmploymentId: Joi.number().max(999999999999999).allow(null).required(),

        service: Joi.object().keys({
          id: Joi.number().max(999999999999999).required(),

          createdDatetimeStamp: Joi.number().max(999999999999999).required(),
          lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
          createdByUserId: Joi.number().max(999999999999999).required(),

          serviceBlueprintId: Joi.number().max(999999999999999).required(),
          outletId: Joi.number().max(999999999999999).required(),

          salePrice: Joi.number().min(0).max(999999999999999).required(),
          isAvailable: Joi.boolean().required()
        }),

        serviceBlueprint: Joi.object().keys({
          id: Joi.number().max(999999999999999).required(),

          createdDatetimeStamp: Joi.number().max(999999999999999).required(),
          lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

          name: Joi.string().min(1).max(64).required(),
          organizationId: Joi.number().max(999999999999999).required(),

          defaultVat: Joi.number().min(0).max(999999999999999).required(),
          defaultSalePrice: Joi.number().min(0).max(999999999999999).required(),

          isLongstanding: Joi.boolean().required(),
          serviceDuration: Joi.object().allow(null).required().keys({
            months: Joi.number().min(0).max(999999999999999).required(),
            days: Joi.number().min(0).max(999999999999999).required(),
          }),

          isEmployeeAssignable: Joi.boolean().required(),
          isCustomerRequired: Joi.boolean().required(),
          isRefundable: Joi.boolean().required(),
          isDeleted: Joi.boolean().required()
        })
      })
    ),

    payment: Joi.object().required().keys({
      totalAmount: Joi.number().max(999999999999999).required(),
      vatAmount: Joi.number().max(999999999999999).required(),
      discountPresetId: Joi.number().max(999999999999999).allow(null).required(),
      discountPresetName: Joi.string().min(0).max(64).allow('').required(),
      discountType: Joi.string().max(1024).required(),
      discountValue: Joi.number().max(999999999999999).required(),
      discountedAmount: Joi.number().max(999999999999999).required(),
      serviceChargeAmount: Joi.number().max(999999999999999).required(),
      totalBillBeforeRounding: Joi.number().max(999999999999999).required(),
      roundedByAmount: Joi.number().max(999999999999999).required(),
      totalBilled: Joi.number().max(999999999999999).required(),

      totalPaidAmount: Joi.number().max(999999999999999).required(),
      paymentList: Joi.array().min(1).items(
        Joi.object().keys({
          createdDatetimeStamp: Joi.number().max(999999999999999).required(),
          acceptedByUserId: Joi.number().max(999999999999999).required(),

          paidAmount: Joi.number().max(999999999999999).required(),
          changeAmount: Joi.number().max(999999999999999).required(),
          paymentMethodId: Joi.number().max(999999999999999).required(),
          wasChangeSavedInChangeWallet: Joi.boolean().required()
        })
      )
    }),

    assistedByEmployeeId: Joi.number().min(0).max(999999999999999).allow(null).required(),

    wasOfflineSale: Joi.boolean().required(),
    isModified: Joi.boolean().required(),
    isDeleted: Joi.boolean().required(),
    isDiscarded: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateServiceMembershipSchemaWhenListObj = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    createdByUserId: Joi.number().max(999999999999999).required(),

    salesId: Joi.number().max(999999999999999).required(),

    customerId: Joi.number().max(999999999999999).required(),
    customerDetails: Joi.object().required().keys({
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
    }),

    serviceId: Joi.number().max(999999999999999).required(),
    serviceBlueprintDetails: Joi.object().keys({
      name: Joi.string().min(1).max(64).required(),
    }),

    assignedEmploymentId: Joi.number().max(999999999999999).allow(null).required(),
    assignedEmployeeDetails: Joi.object().allow(null).required().keys({
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
    }),

    expiringDatetimeStamp: Joi.number().max(999999999999999).required(),

    isDiscarded: Joi.boolean().required(),
    discardReason: Joi.string().allow('').max(128).required(),
    isDeleted: Joi.boolean().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateSalesReturnSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    salesId: Joi.number().max(999999999999999).required(),
    salesNumber: Joi.number().max(999999999999999).required(),

    returnedProductList: Joi.array().items(
      Joi.object().keys({
        productId: Joi.number().max(999999999999999).required(),
        count: Joi.number().max(999999999999999).required(),
        productBlueprintId: Joi.number().max(999999999999999).required(),
        productBlueprintName: Joi.string().min(1).max(64).required(),
        productBlueprintIsReturnable: Joi.boolean().required()
      })
    ),
    creditedAmount: Joi.number().max(999999999999999).required(),
    returnableWasSavedInChangeWallet: Joi.boolean().required(),

    isDeleted: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateSalesReturnSchemaWhenListObj = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    salesId: Joi.number().max(999999999999999).required(),
    salesNumber: Joi.number().max(999999999999999).required(),

    returnedProductList: Joi.array().items(
      Joi.object().keys({
        productId: Joi.number().max(999999999999999).required(),
        count: Joi.number().max(999999999999999).required()
      })
    ),
    creditedAmount: Joi.number().max(999999999999999).required(),
    returnableWasSavedInChangeWallet: Joi.boolean().required(),

    isDeleted: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateUserSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    fullName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
    countryCode: Joi.string().regex(/^[a-z0-9\+]*$/i).min(2).max(4).required(),
    passwordHash: Joi.string().min(64).max(64).required(),
    email: Joi.string().email().min(3).max(30).allow(null).required(),
    nid: Joi.string().min(16).max(16).allow('').required(),
    physicalAddress: Joi.string().min(1).max(128).allow('').required(),
    emergencyContact: Joi.string().min(1).max(128).allow('').required(),
    bloodGroup: Joi.string().alphanum().min(2).max(3).allow('').required(),
    originType: Joi.string().valid('real', 'test', 'unsure').required(),

    isDeleted: Joi.boolean().required(),
    isPhoneVerified: Joi.boolean().required(),
    isEmailVerified: Joi.boolean().required(),
    isBanned: Joi.boolean().required(),
    accessibleApplicationList: Joi.array().items(
      Joi.string().valid('torque', 'torque-lite').required(),
    ).required(),
    agreedToTocDatetimeStamp: Joi.number().max(999999999999999).allow(null).required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAggregatedProductScema = (doc) => {
  let schema = Joi.object().keys({
    productId: Joi.number().max(999999999999999).required(),
    count: Joi.number().max(999999999999999).required(),
    product: Joi.object().keys({
      id: Joi.number().max(999999999999999).required(),

      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      productBlueprintId: Joi.number().max(999999999999999).required(),
      purchasePrice: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required(),
      productBlueprint: Joi.object().keys({
        id: Joi.number().max(999999999999999).required(),

        createdDatetimeStamp: Joi.number().max(999999999999999).required(),
        lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

        name: Joi.string().min(1).max(64).required(),
        organizationId: Joi.number().max(999999999999999).required(),
        unit: Joi.string().max(64).required(),
        identifierCode: Joi.string().max(64).allow('').required(),
        defaultPurchasePrice: Joi.number().max(999999999999999).required(),
        defaultVat: Joi.number().max(999999999999999).required(),
        defaultSalePrice: Joi.number().max(999999999999999).required(),
        isDeleted: Joi.boolean().required(),
        productCategoryIdList: Joi.array().items(Joi.number()).required(),
        isReturnable: Joi.boolean().required()
      })
    })
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateEmploymentSchema = (doc) => {
  const { getPrivilegesSchemaFromJson } = require('../src/utils/privilege-loader');

  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    userId: Joi.number().max(999999999999999).required(),
    userDetails: Joi.object().required().keys({
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      email: Joi.string().email().min(3).max(30).allow(null).required(),
      nid: Joi.string().min(16).max(16).allow('').required(),
      physicalAddress: Joi.string().min(1).max(128).allow('').required(),
      emergencyContact: Joi.string().min(1).max(128).allow('').required(),
      bloodGroup: Joi.string().alphanum().min(2).max(3).allow('').required()
    }),

    organizationId: Joi.number().max(999999999999999).required(),
    designation: Joi.string().max(64).required(),
    role: Joi.string().max(64).required(),
    companyProvidedId: Joi.string().allow('').max(64).required(),

    privileges: getPrivilegesSchemaFromJson(),

    isActive: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateAddDiscountPresetApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    status: Joi.string().required().equal('success'),
    discountPresetId: Joi.number().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGetDiscountPresetListApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    discountPresetList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateDiscountPresetSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    name: Joi.string().min(1).max(64).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    discountType: Joi.string().valid('percent', 'fixed').required(),
    discountValue: Joi.number().max(999999999999999).required(),

    isDeleted: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}


exports.validateReportCollectionDetailsApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    collectionList: Joi.array().required()
  });

  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateCollectionSchema = (doc) => {
  let schema = Joi.object().keys({
    salesId: Joi.number().max(999999999999999).required(),
    salesNumber: Joi.number().max(999999999999999).required(),
    collectedAmount: Joi.number().max(999999999999999).required(),
    collectedByUserId: Joi.number().max(999999999999999).required(),
    collectedDatetimeStamp: Joi.number().max(999999999999999).required(),
    collectedByUser: Joi.object().keys({
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
    }),
    // FIXME
    // paymentMethodId: Joi.number().max(999999999999999).required(),
    paymentMethodId: Joi.optional(),
    paymentMethod: Joi.optional(),
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateGraphSalesApiSuccessResponse = (doc) => {
  let schema = Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    graphData: Joi.object().keys({
      labelList: Joi.array().items(Joi.string()).required(),
      sumTotalBilledList: Joi.array().items(Joi.number()).required(),
      sumCountList: Joi.array().items(Joi.number()).required()
    })
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
  let { labelList, sumTotalBilledList, sumCountList } = doc.graphData;
  if (labelList.length !== sumTotalBilledList.length || labelList.length !== sumCountList.length) {
    throw new Error("GraphSalesApi labelList, sumTotalBilledList & sumCountList has unequal length");
  }
}