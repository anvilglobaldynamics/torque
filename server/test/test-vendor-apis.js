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

  validateAddVendorApiSuccessResponse,
  validateGenericApiSuccessResponse,
  validateGenericApiFailureResponse,
  validateGetVendorListApiSuccessResponse,
  validateVendorSchema
} = require('./lib');

let apiKey = null;
let organizationId = null;
let vendor = null;

let invalidVendorId = generateInvalidId();

const prefix = 's';

const password = "123545678";
const fullName = "Test User";
const phone = rnd(prefix, 11);

const orgEmail = 'o' + `${rnd(prefix)}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "My Address";
const orgPhone = 'o' + rnd(prefix, 11);

const vendorPhone = 'v1' + rnd(prefix, 11);
const vendorPhone2 = 'v2' + rnd(prefix, 11);
const vendorPhone3 = 'v3' + rnd(prefix, 11);

describe('Vendor', _ => {

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
            testDoneFn();
          })
        });
      });
    });
  });

  // Add - start

  it('api/add-vendor (Valid)', testDoneFn => {

    callApi('api/add-vendor', {
      json: {
        apiKey,
        organizationId,
        name: "1st vendor",
        contactPersonName: "a person",
        phone: vendorPhone,
        physicalAddress: "an address"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddVendorApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/add-vendor (Invalid, copy name)', testDoneFn => {

    callApi('api/add-vendor', {
      json: {
        apiKey,
        organizationId,
        name: "1st vendor",
        contactPersonName: "a person",
        phone: vendorPhone2,
        physicalAddress: "an address"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      testDoneFn();
    })

  });

  it('api/add-vendor (Invalid, copy phone)', testDoneFn => {

    callApi('api/add-vendor', {
      json: {
        apiKey,
        organizationId,
        name: "2nd vendor",
        contactPersonName: "a person",
        phone: vendorPhone,
        physicalAddress: "an address"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('PHONE_ALREADY_IN_USE');
      testDoneFn();
    })

  });

  it('api/add-vendor (Valid)', testDoneFn => {

    callApi('api/add-vendor', {
      json: {
        apiKey,
        organizationId,
        name: "2nd vendor",
        contactPersonName: "a person",
        phone: vendorPhone2,
        physicalAddress: "an address"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddVendorApiSuccessResponse(body);
      testDoneFn();
    })

  });

  // Add - end
  // Get - start

  it('api/get-vendor-list (No parameters)', testDoneFn => {

    callApi('api/get-vendor-list', {
      json: {
        apiKey,
        organizationId,
        searchString: '',
        vendorIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetVendorListApiSuccessResponse(body);

      body.vendorList.forEach(vendor => {
        validateVendorSchema(vendor);
      });

      expect(body.vendorList.length).to.equal(2);
      vendor = body.vendorList[0];

      testDoneFn();
    });

  });

  it('api/get-vendor-list (Valid, vendorIdList)', testDoneFn => {

    callApi('api/get-vendor-list', {
      json: {
        apiKey,
        organizationId,
        searchString: '',
        vendorIdList: [vendor.id]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetVendorListApiSuccessResponse(body);

      body.vendorList.forEach(vendor => {
        validateVendorSchema(vendor);
      });

      expect(body.vendorList.length).to.equal(1);
      testDoneFn();
    });

  });

  it('api/get-vendor-list (Valid, searchString)', testDoneFn => {

    callApi('api/get-vendor-list', {
      json: {
        apiKey,
        organizationId,
        searchString: '1st vendor',
        vendorIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetVendorListApiSuccessResponse(body);

      body.vendorList.forEach(vendor => {
        validateVendorSchema(vendor);
      });

      expect(body.vendorList.length).to.equal(1);
      testDoneFn();
    });

  });

  it('api/get-vendor-list (Invalid vendorIdList)', testDoneFn => {

    callApi('api/get-vendor-list', {
      json: {
        apiKey,
        organizationId,
        searchString: '',
        vendorIdList: [invalidVendorId]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('VENDOR_INVALID');
      testDoneFn();
    });

  });

  // Get - end
  // Edit - start

  it('api/edit-vendor (Inalid vendorId)', testDoneFn => {

    callApi('api/edit-vendor', {
      json: {
        apiKey,
        vendorId: invalidVendorId,
        name: vendor.name,
        contactPersonName: vendor.contactPersonName,
        phone: vendorPhone,
        physicalAddress: vendor.physicalAddress
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('VENDOR_INVALID');
      testDoneFn();
    })

  });

  it('api/edit-vendor (Inalid, copy phone)', testDoneFn => {

    callApi('api/edit-vendor', {
      json: {
        apiKey,
        vendorId: vendor.id,
        name: "1st new vendor",
        contactPersonName: vendor.contactPersonName,
        phone: vendorPhone,
        physicalAddress: vendor.physicalAddress
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('PHONE_ALREADY_IN_USE');
      testDoneFn();
    })

  });

  it('api/edit-vendor (Inalid, copy name)', testDoneFn => {

    callApi('api/edit-vendor', {
      json: {
        apiKey,
        vendorId: vendor.id,
        name: "1st vendor",
        contactPersonName: vendor.contactPersonName,
        phone: vendor.phone,
        physicalAddress: vendor.physicalAddress
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      testDoneFn();
    })

  });

  it('api/edit-vendor (Valid)', testDoneFn => {

    callApi('api/edit-vendor', {
      json: {
        apiKey,
        vendorId: vendor.id,
        name: "1st new vendor",
        contactPersonName: vendor.contactPersonName + " new",
        phone: vendorPhone3,
        physicalAddress: vendor.physicalAddress + " new"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/get-vendor-list (Valid, check)', testDoneFn => {

    callApi('api/get-vendor-list', {
      json: {
        apiKey,
        organizationId,
        searchString: '',
        vendorIdList: [vendor.id]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetVendorListApiSuccessResponse(body);

      body.vendorList.forEach(vendor => {
        validateVendorSchema(vendor);
      });

      expect(body.vendorList.length).to.equal(1);

      expect(body.vendorList[0].name).to.equal("1st new vendor");
      expect(body.vendorList[0].phone).to.equal(vendorPhone3);
      testDoneFn();
    });

  });

  // Edit - end

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});