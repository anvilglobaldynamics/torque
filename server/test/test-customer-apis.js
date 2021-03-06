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
  validateAddCustomerApiSuccessResponse,
  validateGetCustomerSummaryListApiSuccessResponse,
  validateGetCustomerApiSuccessResponse,
  validateGenericApiSuccessResponse,
  validateGenericApiFailureResponse,
  validateCustomerSchema,
  addCustomer
} = require('./lib');

const prefix = 's';

const email = `${rnd(prefix)}@gmail.com`;
const phone = rnd(prefix, 11);
const password = "123545678";
const fullName = "Test User";

const orgEmail = 'o' + `${rnd(prefix)}@gmail.com`;
const orgPhone = 'o' + rnd(prefix, 11);
const orgEmail2 = 'o2' + `${rnd(prefix)}@gmail.com`;
const orgPhone2 = 'o2' + rnd(prefix, 11);
const customerPhone = 'c' + rnd(prefix, 11);
const updatedCustomerPhone = 'c2' + rnd(prefix, 11);
const customerPhone2 = 'c3' + rnd(prefix, 11);

let apiKey = null;
let firstCustomer = null;
let secondCustomer = null;
let organizationId = null;
let secondOrganizationId = null;
let invalidOrganizationId = generateInvalidId();
let invalidCustomerId = generateInvalidId();

describe('Customer', _ => {

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
            name: "My Organization",
            primaryBusinessAddress: "My Address",
            phone: orgPhone,
            email: orgEmail
          }, (data) => {
            organizationId = data.organizationId
            addOrganization({
              apiKey,
              name: "My 2nd Organization",
              primaryBusinessAddress: "My Address",
              phone: orgPhone2,
              email: orgEmail2
            }, (data) => {
              secondOrganizationId = data.organizationId;
              testDoneFn();
            });
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
        email: null,
        address: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('ORGANIZATION_INVALID');
      testDoneFn();
    })

  });

  it('api/add-customer (Valid, Unique): ', testDoneFn => {

    callApi('api/add-customer', {
      json: {
        apiKey,
        organizationId: organizationId,
        fullName: "1st Test Customer",
        phone: customerPhone,
        email: null,
        address: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddCustomerApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/add-customer (Valid, 2nd Unique): ', testDoneFn => {

    callApi('api/add-customer', {
      json: {
        apiKey,
        organizationId: organizationId,
        fullName: "2nd Test Customer",
        phone: customerPhone2,
        email: null,
        address: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddCustomerApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/add-customer (Valid, 2nd Organization, same customer phone): ', testDoneFn => {

    callApi('api/add-customer', {
      json: {
        apiKey,
        organizationId: secondOrganizationId,
        fullName: "2nd Test Customer",
        phone: customerPhone2,
        email: null,
        address: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddCustomerApiSuccessResponse(body);
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
        email: null,
        address: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('PHONE_ALREADY_IN_USE');
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
        email: null,
        address: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('VALIDATION_ERROR');
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
        email: null,
        address: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('VALIDATION_ERROR');
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
        email: null,
        address: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('VALIDATION_ERROR');
      testDoneFn();
    })

  });

  it('api/get-customer-summary-list (Valid)', testDoneFn => {

    callApi('api/get-customer-summary-list', {
      json: {
        apiKey,
        organizationId: organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetCustomerSummaryListApiSuccessResponse(body);

      body.customerList.forEach(customer => {
        validateCustomerSchema(customer)
      });

      body.customerList.reverse();

      firstCustomer = body.customerList[0];
      secondCustomer = body.customerList[1];

      testDoneFn();
    })

  });

  it('api/get-customer-summary-list (Valid searchString)', testDoneFn => {

    callApi('api/get-customer-summary-list', {
      json: {
        apiKey,
        organizationId: organizationId,
        searchString: "2nd"
      }
    }, (err, response, body) => {      
      expect(response.statusCode).to.equal(200);

      validateGetCustomerSummaryListApiSuccessResponse(body);
      body.customerList.forEach(customer => {
        validateCustomerSchema(customer)
      });

      testDoneFn();
    })

  });

  it('api/get-customer-summary-list (Invalid organizationId)', testDoneFn => {
    // NOTE: foreign key violations are not verified for find/findOne calls since
    // foreign key is validated during insert/update calls and so legacyDatabase actively
    // rejects records that could violate foreign key definitions.
    callApi('api/get-customer-summary-list', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('ORGANIZATION_INVALID');
      testDoneFn();
    })

  });

  it('api/edit-customer (Invalid, copy phone)', testDoneFn => {

    callApi('api/edit-customer', {
      json: {
        apiKey,
        customerId: firstCustomer.id,
        fullName: "A Test Customer",
        phone: customerPhone2,
        email: null,
        address: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('PHONE_ALREADY_IN_USE');
      testDoneFn();
    })

  });

  it('api/edit-customer (Valid, Unique)', testDoneFn => {

    callApi('api/edit-customer', {
      json: {
        apiKey,
        customerId: firstCustomer.id,
        fullName: "A Test Customer",
        phone: updatedCustomerPhone,
        email: null,
        address: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/edit-customer (Invalid customerId)', testDoneFn => {

    callApi('api/edit-customer', {
      json: {
        apiKey,
        customerId: invalidCustomerId,
        fullName: "A Test Customer",
        phone: updatedCustomerPhone,
        email: null,
        address: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('CUSTOMER_INVALID');
      testDoneFn();
    })

  });

  it('api/get-customer (Valid modification check): ', testDoneFn => {

    callApi('api/get-customer', {
      json: {
        apiKey,
        customerId: firstCustomer.id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetCustomerApiSuccessResponse(body);
      expect(body.customer.phone).to.equal(updatedCustomerPhone);
      validateCustomerSchema(body.customer)
      testDoneFn();
    })

  });

  it('api/delete-customer (Confirm that API is disabled): ', testDoneFn => {

    callApi('api/delete-customer', {
      json: {
        apiKey,
        customerId: invalidCustomerId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('API_DISABLED');
      testDoneFn();
    })

  });

  it('api/get-customer (Invalid customerId): ', testDoneFn => {

    callApi('api/get-customer', {
      json: {
        apiKey,
        customerId: invalidCustomerId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('CUSTOMER_INVALID');
      testDoneFn();
    })

  });

  it('api/get-customer-summary-list (Valid, Pagination)', testDoneFn => {
    let basePhone = 'cx' + rnd(prefix, 9);
    Promise.all((new Array(50).fill(0)).map((item, index) => new Promise((accept, reject) => {
      addCustomer({
        apiKey,
        organizationId,
        fullName: 'Sample Customer' + index,
        phone: (basePhone + index),
        email: null,
        address: ''
      }, (data) => {
        return accept();
      });
    }))).then(() => {
      callApi('api/get-customer-summary-list', {
        json: {
          apiKey,
          organizationId
        }
      }, (err, response, body) => {
        expect(response.statusCode).to.equal(200);
        expect(body).to.have.property('hasError').that.equals(false);
        expect(body).to.have.property('customerList');
        body.customerList.forEach(customer => {
          validateCustomerSchema(customer);
        });
        expect(body.customerList.length).to.be.greaterThan(49);
        let knownFullLength = body.customerList.length;
        callApi('api/get-customer-summary-list', {
          json: {
            apiKey,
            organizationId,
            paginate: {
              offset: 0,
              limit: 30
            }
          }
        }, (err, response, body) => {
          expect(response.statusCode).to.equal(200);
          expect(body).to.have.property('hasError').that.equals(false);
          expect(body).to.have.property('pagination');
          expect(body.pagination).to.have.property('offset').that.equals(0);
          expect(body.pagination).to.have.property('limit').that.equals(30);
          expect(body.pagination).to.have.property('totalCount').that.equals(knownFullLength);;
          expect(body).to.have.property('customerList');
          body.customerList.forEach(customer => {
            validateCustomerSchema(customer);
          });
          expect(body.customerList.length).to.equal(30);
          // next batch start
          callApi('api/get-customer-summary-list', {
            json: {
              apiKey,
              organizationId,
              paginate: {
                offset: 30,
                limit: 30
              }
            }
          }, (err, response, body) => {
            expect(response.statusCode).to.equal(200);
            expect(body).to.have.property('hasError').that.equals(false);
            expect(body).to.have.property('pagination');
            expect(body.pagination).to.have.property('offset').that.equals(30);
            expect(body.pagination).to.have.property('limit').that.equals(Math.min(30, knownFullLength - 30));
            expect(body.pagination).to.have.property('totalCount').that.equals(knownFullLength);;
            expect(body).to.have.property('customerList');
            body.customerList.forEach(customer => {
              validateCustomerSchema(customer);
            });
            expect(body.customerList.length).to.equal(Math.min(30, knownFullLength - 30));
            testDoneFn();
          });
          // next batch end
        });
      });
    });
  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});