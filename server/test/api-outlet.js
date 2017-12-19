let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization,
  validateOutletSchema,
  validateEmbeddedInventorySchema
} = require('./lib');

const email = `t2${(new Date).getTime()}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = 't2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const orgEmail = `o2${(new Date).getTime()}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "My Address";
const orgPhone = 'o2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const outletPhone = 'o2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');
const outletPhone2 = 'o2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

let apiKey = null;
let organizationId = null;
let outletList = null;
let outletToBeModified = null;

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