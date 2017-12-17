let { callApi } = require('./utils');
let { Program } = require('./../src/index');
let Joi = require('joi');

let mainProgram = new Program({ allowUnsafeApis: false, muteLogger: true });
let hasStarted = false;
let pendingTerminationRequest = false;

// ===================================== Server

exports.getDatabase = () => { return mainProgram.exposeDatabaseForTesting(); }

exports.initializeServer = (callback) => {
  pendingTerminationRequest = false;
  if (hasStarted) {
    setTimeout(_ => {
      callback();
    }, 10);
    return;
  }
  mainProgram.initiateServer(_ => {
    hasStarted = true;
    setTimeout(_ => {
      callback();
    }, 10);
  });
}

exports.terminateServer = (callback) => {
  pendingTerminationRequest = true;
  setTimeout(_ => {
    if (pendingTerminationRequest) {
      mainProgram.terminateServer();
    }
  }, 300);
  callback();
}

// ===================================== User

exports.registerUser = (data, callback) => {
  callApi('api/user-register', {
    json: data
  }, (err, response, body) => {
    setTimeout(_ => {
      callback(body);
    }, 10);
  })
}

exports.loginUser = (data, callback) => {
  callApi('api/user-login', {
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

exports.validateCustomerSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),
    _id: Joi.string().required(),
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    fullName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().alphanum().min(11).max(14).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    balance: Joi.number().max(999999999999999).required(),
    isDeleted: Joi.boolean().required(),

    additionalPaymentHistory: Joi.array().items(
      Joi.object().keys({
        creditedDatetimeStamp: Joi.number().max(999999999999999).required(),
        acceptedByUserId: Joi.number().max(999999999999999).required(),
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
    _id: Joi.string().required(),
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    name: Joi.string().min(1).max(64).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    physicalAddress: Joi.string().min(1).max(128).required(),
    contactPersonName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().alphanum().min(11).max(14).required(),

    isDeleted: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateOrganizationSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),
    name: Joi.string().min(1).max(64).required(),
    primaryBusinessAddress: Joi.string().min(1).max(128).required(),
    phone: Joi.string().alphanum().min(11).max(14).required(),
    email: Joi.string().email().min(3).max(30).required(),
    employment: Joi.object().keys({
      designation: Joi.string().max(1024).required(),
      role: Joi.string().max(1024).required(),
      companyProvidedId: Joi.string().alphanum().allow('').required(),
      isActive: Joi.boolean().required(),
      privileges: Joi.object()
    })
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateWarehouseSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),
    _id: Joi.string().required(),
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    name: Joi.string().min(1).max(64).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    physicalAddress: Joi.string().min(1).max(128).required(),
    contactPersonName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().alphanum().min(11).max(14).required(),

    isDeleted: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateProductCategorySchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),
    _id: Joi.string().required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    name: Joi.string().min(1).max(64).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    parentProductCategoryId: Joi.number().max(999999999999999).allow(null).required(),
    unit: Joi.string().max(1024).required(),
    defaultDiscountType: Joi.string().max(1024).required(),
    defaultDiscountValue: Joi.number().when(
      'defaultDiscountType', {
        is: 'percent',
        then: Joi.number().min(0).max(100).required(),
        otherwise: Joi.number().max(999999999999999).required()
      }
    ),
    defaultPurchasePrice: Joi.number().max(999999999999999).required(),
    defaultVat: Joi.number().max(999999999999999).required(),
    defaultSalePrice: Joi.number().max(999999999999999).required(),

    isDeleted: Joi.boolean().required(),
    isReturnable: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateProductSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),
    _id: Joi.string().required(),

    productCategoryId: Joi.number().max(999999999999999).required(),
    purchasePrice: Joi.number().max(999999999999999).required(),
    salePrice: Joi.number().max(999999999999999).required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateInventorySchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),
    _id: Joi.string().required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    inventoryContainerId: Joi.number().max(999999999999999).required(),
    type: Joi.string().valid('default', 'returned', 'damaged').required(),
    name: Joi.string().min(1).max(64).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    allowManualTransfer: Joi.boolean().required(),

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
    allowManualTransfer: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateSalesSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),
    _id: Joi.string().required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    lastModifiedByUserId: Joi.number().max(999999999999999).allow(null).required(),
    outletId: Joi.number().max(999999999999999).required(),
    customerId: Joi.number().max(999999999999999).allow(null).required(),

    productList: Joi.array().items(
      Joi.object().keys({
        productId: Joi.number().max(999999999999999).required(),
        count: Joi.number().max(999999999999999).required(),
        discountType: Joi.string().max(1024).required(),
        discountValue: Joi.number().max(999999999999999).required(),
        salePrice: Joi.number().max(999999999999999).required()
      })
    ),
    payment: Joi.object().keys({
      totalAmount: Joi.number().max(999999999999999).required(),
      vatAmount: Joi.number().max(999999999999999).required(),
      discountType: Joi.string().max(1024).required(),
      discountValue: Joi.number().max(999999999999999).required(),
      discountedAmount: Joi.number().max(999999999999999).required(),
      serviceChargeAmount: Joi.number().max(999999999999999).required(),
      totalBilled: Joi.number().max(999999999999999).required(),
      previousCustomerBalance: Joi.number().max(999999999999999).allow(null).required(),
      paidAmount: Joi.number().max(999999999999999).required(),
      changeAmount: Joi.number().max(999999999999999).required()
    }),

    isModified: Joi.boolean().required(),
    isDeleted: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateSalesReturnSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),
    _id: Joi.string().required(),

    createdDatetimeStamp: Joi.number().max(999999999999999).required(),

    salesId: Joi.number().max(999999999999999).required(),
    returnedProductList: Joi.array().items(
      Joi.object().keys({
        productId: Joi.number().max(999999999999999).required(),
        count: Joi.number().max(999999999999999).required()
      })
    ),
    creditedAmount: Joi.number().max(999999999999999).required(),

    isDeleted: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}

exports.validateUserSchema = (doc) => {
  let schema = Joi.object().keys({
    id: Joi.number().max(999999999999999).required(),
    _id: Joi.string().required(),
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    fullName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().alphanum().min(11).max(14).required(),
    passwordHash: Joi.string().min(64).max(64).required(),
    email: Joi.string().email().min(3).max(30).required(),
    nid: Joi.string().min(16).max(16).allow('').required(),
    physicalAddress: Joi.string().min(1).max(128).allow('').required(),
    emergencyContact: Joi.string().min(6).max(11).allow('').required(),
    bloodGroup: Joi.string().alphanum().min(2).max(3).allow('').required(),

    isDeleted: Joi.boolean().required(),
    isPhoneVerified: Joi.boolean().required(),
    isEmailVerified: Joi.boolean().required(),
    isBanned: Joi.boolean().required()
  });
  let { error, value } = Joi.validate(doc, schema);
  if (error) throw error;
}