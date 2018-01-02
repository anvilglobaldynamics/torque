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
  validateOutletSchema,
  validateEmbeddedInventorySchema
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

const outletPhone = 'o1' + rnd(prefix, 11);
const outletPhone2 = 'o2' + rnd(prefix, 11);

let apiKey = null;
let organizationId = null;
let outletList = null;
let outletToBeModified = null;

let invalidOrganizationId = generateInvalidId();
let invalidOutletId = generateInvalidId();

describe('outlet', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      registerUser({
        email, password, fullName, phone
      }, _ => {
        loginUser({
          emailOrPhone: email, password
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
            testDoneFn();
          })
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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it.skip('api/add-outlet (Invalid organization)', testDoneFn => {

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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('ORGANIZATION_INVALID');
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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('outletList').that.is.an('array');
      body.outletList.forEach(outlet => {
        validateOutletSchema(outlet);
      });
      outletList = body.outletList;
      testDoneFn();
    });

  });

  it.skip('api/get-outlet-list (Invalid organization)', testDoneFn => {

    callApi('api/get-outlet-list', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('ORGANIZATION_INVALID');
      testDoneFn();
    });

  });

  it('api/get-outlet (Valid)', testDoneFn => {

    callApi('api/get-outlet', {
      json: {
        apiKey,
        outletId: outletList[0].id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('outlet');
      expect(body).to.have.property('defaultInventory');
      expect(body).to.have.property('returnedInventory');
      expect(body).to.have.property('damagedInventory');

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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('OUTLET_INVALID');

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it.skip('api/edit-outlet (Invalid outlet)', testDoneFn => {

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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('OUTLET_INVALID');
      
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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('outlet');
      expect(body).to.have.property('defaultInventory');
      expect(body).to.have.property('returnedInventory');
      expect(body).to.have.property('damagedInventory');
      expect(body.outlet.phone).to.equal(outletPhone2);

      validateOutletSchema(body.outlet);
      validateEmbeddedInventorySchema(body.defaultInventory);
      validateEmbeddedInventorySchema(body.returnedInventory);
      validateEmbeddedInventorySchema(body.damagedInventory);
      testDoneFn();
    });

  });

  it('api/delete-outlet (Valid)', testDoneFn => {

    callApi('api/delete-outlet', {
      json: {
        apiKey,
        outletId: outletToBeModified.id,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('outlet');
      expect(body.outlet.isDeleted).to.equal(true);
      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});