let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  rnd,
  generateInvalidId,
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization,
  addProductBlueprint,
  validateWarehouseSchema,
  validateEmbeddedInventorySchema,

  validateGenericApiFailureResponse,
  validateAddWarehouseApiSuccessResponse,
  validateGetWarehouseListApiSuccessResponse,
  validateGetWarehouseApiSuccessResponse,
  validateGenericApiSuccessResponse,

  validateAdminAssignPackageToOrganizationApiSuccessResponse,
  validateAddProductToInventoryApiSuccessResponse
} = require('./lib');

const prefix = 's';

const adminUsername = "default";
const adminPassword = "johndoe1pass";

const email = `${rnd(prefix)}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = rnd(prefix, 11);

const orgEmail = 'o' + `${rnd(prefix)}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "My Address";
const orgPhone = 'o' + rnd(prefix, 11);

const warehousePhone = 'w1' + rnd(prefix, 11);
const warehousePhone2 = 'w2' + rnd(prefix, 11);
const warehousePhone3 = 'w3' + rnd(prefix, 11);
const warehousePhone4 = 'w4' + rnd(prefix, 11);

let apiKey = null;
let adminApiKey = null;
let organizationId = null;
let productBlueprintId = null;
let warehouseList = null;
let warehouseToBeModified = null;
let warehouseToBeFilledId = null;
let warehouseDefaultInventoryId = null;

let invalidOrganizationId = generateInvalidId();
let invalidWarehouseId = generateInvalidId();

describe('Warehouse', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      registerUser({
        password, fullName, phone
      }, _ => {
        loginUser({
          emailOrPhone: phone, password
        }, (data) => {
          apiKey = data.apiKey;
          addOrganization({
            apiKey,
            name: orgName,
            primaryBusinessAddress: orgBusinessAddress,
            phone: orgPhone,
            email: orgEmail
          }, (data) => {
            organizationId = data.organizationId;
            addProductBlueprint({
              apiKey,
              organizationId,
              name: "test product blueprint",
              unit: "box",
              identifierCode: '',
              defaultPurchasePrice: 99,
              defaultVat: 3,
              defaultSalePrice: 111,
              productCategoryIdList: [],
              isReturnable: true
            }, (data) => {
              productBlueprintId = data.productBlueprintId;
              testDoneFn();
            });
          });
        });
      });
    });
  });

  it('api/add-warehouse (Invalid organizationId)', testDoneFn => {

    callApi('api/add-warehouse', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId,
        name: "My Warehouse",
        physicalAddress: "wayne manor address",
        phone: warehousePhone,
        contactPersonName: "test contact person name"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('ORGANIZATION_INVALID');
      testDoneFn();
    })

  });

  it('api/add-warehouse (Valid)', testDoneFn => {

    callApi('api/add-warehouse', {
      json: {
        apiKey,
        organizationId,
        name: "My Warehouse",
        physicalAddress: "wayne manor address",
        phone: warehousePhone,
        contactPersonName: "test contact person name"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddWarehouseApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/add-warehouse (Invalid default enterprise package outlet limit)', testDoneFn => {

    callApi('api/add-warehouse', {
      json: {
        apiKey,
        clientLanguage: "bn-bd",
        organizationId,
        name: "My Warehouse tobefilled",
        physicalAddress: "wayne manor address new",
        phone: warehousePhone4,
        contactPersonName: "test contact person name"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('ORGANIZATION_PACKAGE_LIMIT_REACHED');
      testDoneFn();
    })

  });

  // prerequisite - start

  it('api/admin-login', testDoneFn => {

    callApi('api/admin-login', {
      json: {
        username: adminUsername,
        password: adminPassword
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string');
      expect(body).to.have.property('sessionId').that.is.a('number');
      expect(body).to.have.property('admin').that.is.an('object');
      adminApiKey = body.apiKey;
      testDoneFn();
    })

  });

  it('api/admin-assign-package-to-organization (Valid)', testDoneFn => {

    callApi('api/admin-assign-package-to-organization', {
      json: {
        apiKey: adminApiKey,
        organizationId,
        packageCode: "R-U01",
        paymentReference: "joi test"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAdminAssignPackageToOrganizationApiSuccessResponse(body);
      testDoneFn();
    });

  });

  // prerequisite - start

  it('api/add-warehouse (Valid 2nd)', testDoneFn => {

    callApi('api/add-warehouse', {
      json: {
        apiKey,
        organizationId,
        name: "My Warehouse 2",
        physicalAddress: "wayne manor address",
        phone: warehousePhone2,
        contactPersonName: "test contact person name"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddWarehouseApiSuccessResponse(body);
      warehouseToBeFilledId = body.warehouseId;
      testDoneFn();
    })

  });

  it('api/get-warehouse-list (Invalid organizationId)', testDoneFn => {

    callApi('api/get-warehouse-list', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('ORGANIZATION_INVALID');
      testDoneFn();
    });

  });

  it('api/get-warehouse-list (Valid)', testDoneFn => {

    callApi('api/get-warehouse-list', {
      json: {
        apiKey,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetWarehouseListApiSuccessResponse(body);
      expect(body.warehouseList.length).to.equals(2);
      body.warehouseList.forEach(warehouse => {
        validateWarehouseSchema(warehouse);
      });

      warehouseList = body.warehouseList;
      testDoneFn();
    });

  });

  it('api/get-warehouse (Invalid warehouseId)', testDoneFn => {

    callApi('api/get-warehouse', {
      json: {
        apiKey,
        warehouseId: invalidWarehouseId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('WAREHOUSE_INVALID');
      testDoneFn();
    });

  });

  it('api/get-warehouse (Valid)', testDoneFn => {

    callApi('api/get-warehouse', {
      json: {
        apiKey,
        warehouseId: warehouseList[warehouseList.length - 1].id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetWarehouseApiSuccessResponse(body);
      validateWarehouseSchema(body.warehouse);
      validateEmbeddedInventorySchema(body.defaultInventory);
      validateEmbeddedInventorySchema(body.returnedInventory);
      validateEmbeddedInventorySchema(body.damagedInventory);

      warehouseToBeModified = body.warehouse;
      testDoneFn();
    });

  });

  it('api/get-warehouse (Valid 2nd)', testDoneFn => {

    callApi('api/get-warehouse', {
      json: {
        apiKey,
        warehouseId: warehouseToBeFilledId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetWarehouseApiSuccessResponse(body);
      validateWarehouseSchema(body.warehouse);
      validateEmbeddedInventorySchema(body.defaultInventory);
      validateEmbeddedInventorySchema(body.returnedInventory);
      validateEmbeddedInventorySchema(body.damagedInventory);

      warehouseDefaultInventoryId = body.defaultInventory.id;
      testDoneFn();
    });

  });

  it('api/edit-warehouse (Invalid)', testDoneFn => {

    callApi('api/edit-warehouse', {
      json: {
        apiKey,
        warehouseId: invalidWarehouseId,

        name: "My Warehouse",
        physicalAddress: "wayne manor address",
        phone: warehousePhone3,
        contactPersonName: "test contact person name"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('WAREHOUSE_INVALID');
      testDoneFn();
    })

  });

  it('api/edit-warehouse (Valid)', testDoneFn => {

    callApi('api/edit-warehouse', {
      json: {
        apiKey,
        warehouseId: warehouseToBeModified.id,

        name: "My Warehouse",
        physicalAddress: "wayne manor address",
        phone: warehousePhone3,
        contactPersonName: "test contact person name"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/get-warehouse (Valid modification check)', testDoneFn => {

    callApi('api/get-warehouse', {
      json: {
        apiKey,
        warehouseId: warehouseToBeModified.id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetWarehouseApiSuccessResponse(body);
      expect(body.warehouse.phone).to.equal(warehousePhone3);

      validateWarehouseSchema(body.warehouse);
      validateEmbeddedInventorySchema(body.defaultInventory);
      validateEmbeddedInventorySchema(body.returnedInventory);
      validateEmbeddedInventorySchema(body.damagedInventory);
      testDoneFn();
    });

  });

  it('api/add-product-to-inventory (Valid warehouse)', testDoneFn => {
    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId,
        productList: [
          { productBlueprintId, count: 10 }
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddProductToInventoryApiSuccessResponse(body);
      testDoneFn();
    });
  });

  it.skip('api/delete-warehouse (Invalid)', testDoneFn => {

    callApi('api/delete-warehouse', {
      json: {
        apiKey,
        warehouseId: invalidWarehouseId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('WAREHOUSE_INVALID');
      testDoneFn();
    })

  });

  it.skip('api/delete-warehouse (Invalid filled)', testDoneFn => {

    callApi('api/delete-warehouse', {
      json: {
        apiKey,
        warehouseId: warehouseToBeFilledId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('WAREHOUSE_NOT_EMPTY');
      testDoneFn();
    })

  });

  it.skip('api/delete-warehouse (Valid)', testDoneFn => {

    callApi('api/delete-warehouse', {
      json: {
        apiKey,
        warehouseId: warehouseToBeModified.id,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it.skip('api/get-warehouse (Deleted)', testDoneFn => {

    callApi('api/get-warehouse', {
      json: {
        apiKey,
        warehouseId: warehouseToBeModified.id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('WAREHOUSE_INVALID');
      testDoneFn();
    });

  });

  it('api/delete-warehouse (Confirm that API is disabled): ', testDoneFn => {

    callApi('api/delete-warehouse', {
      json: {
        apiKey,
        outletId: warehouseToBeModified.id,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('API_DISABLED');
      testDoneFn();
    })

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});