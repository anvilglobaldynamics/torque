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
  addProductCategory,
  validateWarehouseSchema,
  validateEmbeddedInventorySchema
} = require('./lib');

const prefix = 's';

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
let organizationId = null;
let productCategoryId = null;
let warehouseList = null;
let warehouseToBeModified = null;
let warehouseToBeFilledId = null;
let warehouseDefaultInventoryId = null;

let invalidOrganizationId = generateInvalidId();
let invalidWarehouseId = generateInvalidId();

describe.only('warehouse', _ => {

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
            addProductCategory({
              apiKey,
              organizationId,
              parentProductCategoryId: null,
              name: "test product category",
              unit: "box",
              defaultDiscountType: "percent",
              defaultDiscountValue: 10,
              defaultPurchasePrice: 99,
              defaultVat: 3,
              defaultSalePrice: 111,
              isReturnable: true
            }, (data) => {
              productCategoryId = data.productCategoryId;
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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('ORGANIZATION_INVALID');

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it.skip('api/add-warehouse (Invalid copy phone)', testDoneFn => {

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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('PHONE_ALREADY_IN_USE');

      testDoneFn();
    })

  });

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it('api/add-warehouse (Valid 3rd)', testDoneFn => {

    callApi('api/add-warehouse', {
      json: {
        apiKey,
        organizationId,
        name: "My Warehouse tobefilled",
        physicalAddress: "wayne manor address new",
        phone: warehousePhone4,
        contactPersonName: "test contact person name"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');

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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('ORGANIZATION_INVALID');

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
      expect(body).to.have.property('hasError').that.equals(false);

      expect(body).to.have.property('warehouseList').that.is.an('array');
      expect(body.warehouseList.length).to.equals(3);
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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('WAREHOUSE_INVALID');

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('warehouse');
      expect(body).to.have.property('defaultInventory');
      expect(body).to.have.property('returnedInventory');
      expect(body).to.have.property('damagedInventory');

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('warehouse');
      expect(body).to.have.property('defaultInventory');
      expect(body).to.have.property('returnedInventory');
      expect(body).to.have.property('damagedInventory');

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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('WAREHOUSE_INVALID');

      testDoneFn();
    })

  });

  it.skip('api/edit-warehouse (Invalid copy phone)', testDoneFn => {

    callApi('api/edit-warehouse', {
      json: {
        apiKey,
        warehouseId: warehouseToBeModified.id,

        name: "My Warehouse",
        physicalAddress: "wayne manor address",
        phone: warehousePhone2,
        contactPersonName: "test contact person name"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('PHONE_ALREADY_IN_USE');

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('warehouse');
      expect(body).to.have.property('defaultInventory');
      expect(body).to.have.property('returnedInventory');
      expect(body).to.have.property('damagedInventory');
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
          { productCategoryId, purchasePrice: 100, salePrice: 200, count: 10 }
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      testDoneFn();
    });
  });

  it('api/delete-warehouse (Invalid)', testDoneFn => {

    callApi('api/delete-warehouse', {
      json: {
        apiKey,
        warehouseId: invalidWarehouseId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('WAREHOUSE_INVALID');

      testDoneFn();
    })

  });

  it('api/delete-warehouse (Invalid filled)', testDoneFn => {

    callApi('api/delete-warehouse', {
      json: {
        apiKey,
        warehouseId: warehouseToBeFilledId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('WAREHOUSE_NOT_EMPTY');

      testDoneFn();
    })

  });

  it('api/delete-warehouse (Valid)', testDoneFn => {

    callApi('api/delete-warehouse', {
      json: {
        apiKey,
        warehouseId: warehouseToBeModified.id,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it('api/get-warehouse (Deleted)', testDoneFn => {

    callApi('api/get-warehouse', {
      json: {
        apiKey,
        warehouseId: warehouseToBeModified.id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('WAREHOUSE_INVALID');
      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});