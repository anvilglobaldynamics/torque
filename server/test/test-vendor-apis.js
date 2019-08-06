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

  validateAddVendorApiSuccessResponse
} = require('./lib');

let apiKey = null;
let organizationId = null;

const prefix = 's';

const password = "123545678";
const fullName = "Test User";
const phone = rnd(prefix, 11);

const orgEmail = 'o' + `${rnd(prefix)}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "My Address";
const orgPhone = 'o' + rnd(prefix, 11);

describe.only('Vendor', _ => {

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

  // ADD-GET

  it('api/add-vendor (Valid)', testDoneFn => {

    callApi('api/add-vendor', {
      json: {
        apiKey,
        organizationId,
        name: "1st vendor",
      }
    }, (err, response, body) => {
      console.log(body);
      expect(response.statusCode).to.equal(200);
      validateAddVendorApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});