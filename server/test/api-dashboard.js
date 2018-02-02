/* global it, describe */

let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  rnd,
  generateInvalidId,
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization
} = require('./lib');

const prefix = 's';

const email = `${rnd(prefix)}@gmail.com`;
const phone = rnd(prefix, 11);
const password = "123545678";
const fullName = "Test User";

const orgEmail = `o${rnd(prefix)}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "My Address";
const orgPhone = 'o' + rnd(prefix, 11);

let apiKey = null;
let organizationId = null;
let invalidOrganizationId = generateInvalidId();

describe.only('dashboard', _ => {

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
          });
        });
      });
    });
  });

  it('api/get-dashboard-summary (Valid)', testDoneFn => {

    callApi('api/get-dashboard-summary', {
      json: {
        apiKey, 
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('metrics');
      expect(body.metrics).to.have.property('totalNumberOfSalesToday');
      expect(body.metrics).to.have.property('totalAmountSoldToday');
      expect(body.metrics).to.have.property('totalNumberOfSalesThisMonth');
      expect(body.metrics).to.have.property('totalAmountSoldThisMonth');

      testDoneFn();
    });

  });

  it('api/get-dashboard-summary (Invalid)', testDoneFn => {

    callApi('api/get-dashboard-summary', {
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

  // TODO: check after sales

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});