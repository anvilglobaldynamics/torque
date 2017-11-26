let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization,
  validateOrganizationSchema
} = require('./lib');

const email = `t${(new Date).getTime()}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = 't' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');
const orgEmail = `o${(new Date).getTime()}@gmail.com`;
const orgPhone = 'o' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');
const customerPhone = 'o' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');
const updatedCustomerPhone = 'o' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

let apiKey = null;
let customerList = null;
let organizationId = null;
let invalidOrganizationId = 99999999999;

describe('customer', _ => {

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
            name: "My Organization",
            primaryBusinessAddress: "My Address",
            phone: orgPhone,
            email: orgEmail
          }, (data) => {
            organizationId = data.organizationId
            testDoneFn();
          });
        });
      });
    });
  });

  it('api/add-customer (Valid, Foreign Key Invalid): ', testDoneFn => {

    callApi('api/add-customer', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId,
        fullName: "A Test Customer",
        phone: customerPhone,
        openingBalance: '500',
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body.error).to.have.property('code').that.equals('FOREIGN_KEY_VIOLATION');
      testDoneFn();
    })

  });

  it('api/add-customer (Valid, Unique): ', testDoneFn => {

    callApi('api/add-customer', {
      json: {
        apiKey,
        organizationId: organizationId,
        fullName: "A Test Customer",
        phone: customerPhone,
        openingBalance: '500',
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it('api/add-customer (Valid, Not Unique): ', testDoneFn => {

    callApi('api/add-customer', {
      json: {
        apiKey,
        organizationId: organizationId,
        fullName: "A Test Customer",
        phone: customerPhone,
        openingBalance: '500',
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('PHONE_ALREADY_IN_USE');
      testDoneFn();
    })

  });

  it('api/add-customer (Invalid FullName): ', testDoneFn => {

    callApi('api/add-customer', {
      json: {
        apiKey,
        organizationId: organizationId,
        fullName: "",
        phone: customerPhone,
        openingBalance: '500',
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('VALIDATION_ERROR');
      testDoneFn();
    })

  });

  it('api/add-customer (Invalid organizationId): ', testDoneFn => {

    callApi('api/add-customer', {
      json: {
        apiKey,
        organizationId: "abc",
        fullName: "A Test Customer",
        phone: customerPhone,
        openingBalance: '500',
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('VALIDATION_ERROR');
      testDoneFn();
    })

  });

  it('api/add-customer (Invalid phone): ', testDoneFn => {

    callApi('api/add-customer', {
      json: {
        apiKey,
        organizationId: organizationId,
        fullName: "A Test Customer",
        phone: "this is invalid",
        openingBalance: '500',
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('VALIDATION_ERROR');
      testDoneFn();
    })

  });

  it('api/add-customer (Invalid openingBalance): ', testDoneFn => {

    callApi('api/add-customer', {
      json: {
        apiKey,
        organizationId: organizationId,
        fullName: "A Test Customer",
        phone: customerPhone,
        openingBalance: 'abc',
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('VALIDATION_ERROR');
      testDoneFn();
    })

  });

  it('api/get-customer-summary-list (Valid): ', testDoneFn => {

    callApi('api/get-customer-summary-list', {
      json: {
        apiKey,
        organizationId: organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('customerList');
      customerList = body.customerList;
      testDoneFn();
    })

  });

  it('api/get-customer-summary-list (Invalid organizationId but no Foreign Key Error expected): ', testDoneFn => {
    // NOTE: foreign key violations are not verified for find/findOne calls since
    // foreign key is validated during insert/update calls and so database actively
    // rejects records that could violate foreign key definitions.
    callApi('api/get-customer-summary-list', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('customerList').that.deep.equals([]);
      testDoneFn();
    })

  });

  it('api/edit-customer (Valid, Unique): ', testDoneFn => {

    callApi('api/edit-customer', {
      json: {
        apiKey,
        customerId: customerList[customerList.length - 1].id,
        fullName: "A Test Customer",
        phone: updatedCustomerPhone,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it('api/get-customer (Valid): ', testDoneFn => {

    callApi('api/get-customer', {
      json: {
        apiKey,
        customerId: customerList[customerList.length - 1].id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('customer');
      expect(body.customer.phone).to.equal(updatedCustomerPhone);
      validateOrganizationSchema(body.customer)
      testDoneFn();
    })

  });

  it('api/delete-customer (Valid): ', testDoneFn => {

    callApi('api/delete-customer', {
      json: {
        apiKey,
        customerId: customerList[customerList.length - 1].id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it('api/get-customer (Deleted): ', testDoneFn => {

    callApi('api/get-customer', {
      json: {
        apiKey,
        customerId: customerList[customerList.length - 1].id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('customer');
      expect(body.customer.isDeleted).to.equal(true);
      testDoneFn();
    })

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});