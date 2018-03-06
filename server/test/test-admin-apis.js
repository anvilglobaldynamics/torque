let expect = require('chai').expect;
let { callApi } = require('./utils');
let {
  rnd,
  generateInvalidId,
  getDatabase,
  initializeServer,
  terminateServer,
  registerUser
} = require('./lib');

const prefix = 'adm';

const adminUsername = "default";
const adminPassword = "johndoe1pass";

const phone = rnd(prefix, 11);
const password = "123545678";
const fullName = "Test User";

let apiKey = null;

describe('user apis (1)', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      testDoneFn();
    });
  });

  // ================================================== Login

  it('api/admin-login (Correct)', testDoneFn => {

    callApi('api/admin-login', {
      json: {
        username: adminUsername,
        password: adminPassword
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string');
      expect(body).to.have.property('sessionId').that.is.a('number');
      expect(body).to.have.property('admin').that.is.an('object');
      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  // ================================================== Login

  it('api/admin-login (Incorrect)', testDoneFn => {

    callApi('api/admin-login', {
      json: {
        username: adminUsername,
        password: adminPassword + 'GARBAGE'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error').that.is.an('object');
      testDoneFn();
    })

  });

  it('intermittent (user creation)', testDoneFn => {
    registerUser({
      password, fullName, phone
    }, _ => {
      testDoneFn()
    });
  });

  it('api/admin-get-outgoing-sms-list (Valid Date)', testDoneFn => {

    let dateString = new Date().toISOString().slice(0, 10);
    let date = new Date(dateString).getTime();

    callApi('api/admin-get-outgoing-sms-list', {
      json: {
        apiKey,
        date
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('outgoingSmsList').that.is.an('array');
      expect(body.outgoingSmsList.length > 0).to.equal(true);
      expect(body.outgoingSmsList.some(outgoingSms => {
        return outgoingSms.to === phone;
      })).to.equal(true);
      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});