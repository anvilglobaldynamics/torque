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

  validateGenericApiFailureResponse,
  validateGenericApiSuccessResponse
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

let apiKey = null;
let organizationId = null;

describe.only('Accounting', _ => {

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

  it('api/add-account (Valid)', testDoneFn => {

    callApi('api/add-account', {
      json: {
        apiKey,
        organizationId,
        name: "DBDL Bank Account" 
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      testDoneFn();
    })

  });

  it('api/get-account-list (Valid onlyMonetaryAccounts)', testDoneFn => {

    callApi('api/get-account-list', {
      json: {
        apiKey,
        organizationId,
        onlyMonetaryAccounts: true,
        accountIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});