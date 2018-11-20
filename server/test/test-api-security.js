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
  validateCustomerSchema
} = require('./lib');

const prefix = 'S';

const email = `${rnd(prefix)}@gmail.com`;
const phone = rnd(prefix, 11);
const password = "123545678";
const fullName = "Test User";

const orgEmail = 'o' + `${rnd(prefix)}@gmail.com`;
const orgPhone = 'o' + rnd(prefix, 11);
const customerPhone = 'c' + rnd(prefix, 11);
const updatedCustomerPhone = 'c2' + rnd(prefix, 11);

let apiKey = null;
let customerList = null;
let organizationId = null;
let invalidOrganizationId = generateInvalidId();
let invalidCustomerId = generateInvalidId();

describe('Security', _ => {

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
            testDoneFn();
          });
        });
      });
    });
  });

  it('SANITIZATION: api/add-customer (Valid, Unique): ', testDoneFn => {

    callApi('api/add-customer', {
      json: {
        apiKey,
        organizationId: organizationId,
        fullName: "<script>alert('TEST AAA');</script>",
        phone: customerPhone,
        email: null,
        address: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it('SANITIZATION: Value returned by api/get-customer-summary-list MUST be sanitized', testDoneFn => {

    callApi('api/get-customer-summary-list', {
      json: {
        apiKey,
        organizationId: organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('customerList');
      body.customerList.forEach(customer => {
        validateCustomerSchema(customer)
      });
      customerList = body.customerList;
      expect(customerList[0].fullName).to.equal('&lt;script&gt;alert(&apos;TEST AAA&apos;);&lt;/script&gt;');
      testDoneFn();
    })

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});