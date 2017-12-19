let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization
} = require('./lib');

const email = `t2${(new Date).getTime()}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = 't2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const orgEmail = `o2${(new Date).getTime()}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "My Address";
const orgPhone = 'o2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

let apiKey = null;
let organizationId = null;

describe('dashboard', _ => {

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
        apiKey, organizationId
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
    })

  });

  it.skip('api/get-dashboard-summary (Invalid)', testDoneFn => {

    callApi('api/get-dashboard-summary', {
      json: {
        apiKey, organizationId: -9999
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('ORGANIZATION_INVALID');

      testDoneFn();
    })

  });

  // TODO: check after sales

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});