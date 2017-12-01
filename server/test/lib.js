
let { callApi } = require('./utils');
let { Program } = require('./../src/index');
let Joi = require('joi');

let mainProgram = new Program({ allowUnsafeApis: false, muteLogger: true });
let hasStarted = false;
let pendingTerminationRequest = false;

// ===================================== Server

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

// ================================== Validation

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
  let {error, value} = Joi.validate(doc, schema);
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
  let {error, value} = Joi.validate(doc, schema);
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
      isActive: Joi.boolean().required()
    })
  });
  let {error, value} = Joi.validate(doc, schema);
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
  let {error, value} = Joi.validate(doc, schema);
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
    parentProductCategoryId: Joi.number().max(999999999999999).required(),
    unit: Joi.string().max(1024).required(),
    defaultDiscountType: Joi.string().max(1024).required(),
    defaultDiscountValue: Joi.number().max(999999999999999).required(),
    defaultPurchasePrice: Joi.number().max(999999999999999).required(),
    defaultVat: Joi.number().max(999999999999999).required(),
    defaultSalePrice: Joi.number().max(999999999999999).required(),

    isDeleted: Joi.boolean().required(),
    isReturnable: Joi.boolean().required()
  });
  let {error, value} = Joi.validate(doc, schema);
  if (error) throw error;
}