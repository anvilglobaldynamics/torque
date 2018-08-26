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
  validateOutletSchema,
  validateEmbeddedInventorySchema,
  validateAddOutletApiSuccessResponse,
  validateGenericApiFailureResponse,
  validateGetOutletListApiSuccessResponse,
  validateGetOutletApiSuccessResponse,
  validateGenericApiSuccessResponse
} = require('./lib');

const prefix = 's';

const email = `${rnd(prefix)}@gmail.com`;
const phone = rnd(prefix, 11);
const password = "123545678";
const fullName = "Test User";

const orgEmail = 'o' + `${rnd(prefix)}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "My Address";
const orgPhone = 'o' + rnd(prefix, 11);

let productCategoryId = null;
let outletDefaultInventoryId = null;

const outletPhone = 'o1' + rnd(prefix, 11);
const outletPhone2 = 'o2' + rnd(prefix, 11);
const outletPhone3 = 'o3' + rnd(prefix, 11);

let apiKey = null;
let organizationId = null;
let outletList = null;
let outletToBeModified = null;
let outletToBeFilledId = null;

let invalidOrganizationId = generateInvalidId();
let invalidOutletId = generateInvalidId();

describe('Outlet', _ => {

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

  it('api/add-outlet (Valid)', testDoneFn => {

    callApi('api/add-outlet', {
      json: {
        apiKey,
        organizationId,
        name: "My Outlet",
        physicalAddress: "batcave address",
        phone: outletPhone,
        contactPersonName: "test contact person name"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddOutletApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/add-outlet (2nd Valid)', testDoneFn => {

    callApi('api/add-outlet', {
      json: {
        apiKey,
        organizationId,
        name: "My Outlet 2",
        physicalAddress: "batcave address new",
        phone: outletPhone3,
        contactPersonName: "test contact person name"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddOutletApiSuccessResponse(body);
      outletToBeFilledId = body.outletId;
      testDoneFn();
    })

  });

  it('api/add-outlet (Invalid organization)', testDoneFn => {

    callApi('api/add-outlet', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId,
        name: "My Outlet",
        physicalAddress: "batcave address",
        phone: outletPhone,
        contactPersonName: "test contact person name"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('ORGANIZATION_INVALID');
      testDoneFn();
    })

  });

  it.skip('api/add-outlet (Invalid, copy phone)', testDoneFn => {

    callApi('api/add-outlet', {
      json: {
        apiKey,
        organizationId,
        name: "My Outlet",
        physicalAddress: "batcave address",
        phone: outletPhone,
        contactPersonName: "test contact person name"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('PHONE_ALREADY_IN_USE');
      testDoneFn();
    })

  });

  it('api/get-outlet-list (Valid)', testDoneFn => {

    callApi('api/get-outlet-list', {
      json: {
        apiKey,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetOutletListApiSuccessResponse(body);

      body.outletList.forEach(outlet => {
        validateOutletSchema(outlet);
      });
      outletList = body.outletList;

      testDoneFn();
    });

  });

  it('api/get-outlet-list (Invalid organization)', testDoneFn => {

    callApi('api/get-outlet-list', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('ORGANIZATION_INVALID');
      testDoneFn();
    });

  });

  it('api/get-outlet (Valid)', testDoneFn => {

    callApi('api/get-outlet', {
      json: {
        apiKey,
        outletId: outletList[outletList.length - 1].id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetOutletApiSuccessResponse(body);
      validateOutletSchema(body.outlet);
      validateEmbeddedInventorySchema(body.defaultInventory);
      validateEmbeddedInventorySchema(body.returnedInventory);
      validateEmbeddedInventorySchema(body.damagedInventory);

      outletToBeModified = body.outlet;
      testDoneFn();
    });

  });

  it('api/get-outlet (Invalid)', testDoneFn => {

    callApi('api/get-outlet', {
      json: {
        apiKey,
        outletId: invalidOutletId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('OUTLET_INVALID');
      testDoneFn();
    });

  });

  it('api/edit-outlet (Valid)', testDoneFn => {

    callApi('api/edit-outlet', {
      json: {
        apiKey,
        outletId: outletToBeModified.id,

        name: "My Outlet",
        physicalAddress: "batcave address",
        phone: outletPhone2,
        contactPersonName: "new test contact person name"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/edit-outlet (Invalid outlet)', testDoneFn => {

    callApi('api/edit-outlet', {
      json: {
        apiKey,
        outletId: invalidOutletId,

        name: "My Outlet",
        physicalAddress: "batcave address",
        phone: outletPhone2,
        contactPersonName: "new test contact person name"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('OUTLET_INVALID');
      testDoneFn();
    })

  });

  it('api/get-outlet (Valid modification check)', testDoneFn => {

    callApi('api/get-outlet', {
      json: {
        apiKey,
        outletId: outletToBeModified.id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetOutletApiSuccessResponse(body);
      validateOutletSchema(body.outlet);
      validateEmbeddedInventorySchema(body.defaultInventory);
      validateEmbeddedInventorySchema(body.returnedInventory);
      validateEmbeddedInventorySchema(body.damagedInventory);

      expect(body.outlet.phone).to.equal(outletPhone2);
      testDoneFn();
    });

  });

  it('api/get-outlet (2nd Valid)', testDoneFn => {

    callApi('api/get-outlet', {
      json: {
        apiKey,
        outletId: outletToBeFilledId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetOutletApiSuccessResponse(body);
      validateOutletSchema(body.outlet);
      validateEmbeddedInventorySchema(body.defaultInventory);
      validateEmbeddedInventorySchema(body.returnedInventory);
      validateEmbeddedInventorySchema(body.damagedInventory);

      outletDefaultInventoryId = body.defaultInventory.id;
      testDoneFn();
    });

  });

  it('api/add-product-to-inventory (Valid outlet)', testDoneFn => {
    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: outletDefaultInventoryId,
        productList: [
          { productCategoryId, purchasePrice: 100, salePrice: 200, count: 10 }
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });
  });

  it('api/delete-outlet (Invalid outletId)', testDoneFn => {

    callApi('api/delete-outlet', {
      json: {
        apiKey,
        outletId: invalidOutletId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('OUTLET_INVALID');
      testDoneFn();
    })

  });

  it('api/delete-outlet (Invalid filled outlet)', testDoneFn => {

    callApi('api/delete-outlet', {
      json: {
        apiKey,
        outletId: outletToBeFilledId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('OUTLET_NOT_EMPTY');
      testDoneFn();
    })

  });

  it('api/delete-outlet (Valid)', testDoneFn => {

    callApi('api/delete-outlet', {
      json: {
        apiKey,
        outletId: outletToBeModified.id,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/get-outlet (Deleted)', testDoneFn => {

    callApi('api/get-outlet', {
      json: {
        apiKey,
        outletId: outletToBeModified.id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('OUTLET_INVALID');
      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});