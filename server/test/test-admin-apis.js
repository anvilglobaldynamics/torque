let expect = require('chai').expect;
let { callApi } = require('./utils');
let {
  delay,
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
const fullName = "Test " + rnd(prefix, 11);
const fullName2 = "Test " + rnd(prefix, 11).split('').reverse().join('');
const phone2 = rnd(prefix, 11).split('').reverse().join('');

let apiKey = null;

describe.only('admin apis (1)', _ => {

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
      registerUser({
        password, fullName: fullName2, phone: phone2
      }, _ => {
        delay(200, _ => {
          testDoneFn();
        });
      });
    });
  });

  let outgoingSmsList = [];

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
      outgoingSmsList = body.outgoingSmsList;
      testDoneFn();
    });

  });

  it('api/admin-set-outgoing-sms-status (Valid SMS Id, status: sent)', testDoneFn => {

    let status = 'sent';
    let outgoingSmsId = outgoingSmsList.find(outgoingSms => outgoingSms.to === phone).id;

    callApi('api/admin-set-outgoing-sms-status', {
      json: {
        apiKey,
        status,
        outgoingSmsId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    });

  });

  it('api/admin-set-outgoing-sms-status (Valid SMS Id, status: random)', testDoneFn => {

    let status = 'random';
    let outgoingSmsId = outgoingSmsList.find(outgoingSms => outgoingSms.to === phone).id;

    callApi('api/admin-set-outgoing-sms-status', {
      json: {
        apiKey,
        status,
        outgoingSmsId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('VALIDATION_ERROR');
      testDoneFn();
    });

  });

  it('api/admin-set-outgoing-sms-status (Invalid SMS Id, status: sent)', testDoneFn => {

    let status = 'sent';
    let outgoingSmsId = 9559599;

    callApi('api/admin-set-outgoing-sms-status', {
      json: {
        apiKey,
        status,
        outgoingSmsId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('GENERIC_UPDATE_FAILURE');
      testDoneFn();
    });

  });

  it('api/admin-set-outgoing-sms-status (Invalid apiKey)', testDoneFn => {

    let status = 'sent';
    let outgoingSmsId = outgoingSmsList.find(outgoingSms => outgoingSms.to === phone).id;

    callApi('api/admin-set-outgoing-sms-status', {
      json: {
        apiKey: apiKey.split('').reverse().join(''),
        status,
        outgoingSmsId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('APIKEY_INVALID');
      testDoneFn();
    });

  });
  
  it('api/admin-get-aggregated-user-list (phone)', testDoneFn => {

    callApi('api/admin-get-aggregated-user-list', {
      json: {
        apiKey: apiKey,
        userSearchString: phone
        
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('userList').that.is.an('array');
      expect(body.userList.length).to.equal(1);
      expect(body.userList[0].fullName).to.equal(fullName);
      testDoneFn();
    });

  });

  it('api/admin-get-aggregated-user-list (fullName)', testDoneFn => {

    callApi('api/admin-get-aggregated-user-list', {
      json: {
        apiKey: apiKey,
        userSearchString: fullName
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('userList').that.is.an('array');
      expect(body.userList.length).to.equal(1);
      expect(body.userList[0].phone).to.equal(phone);
      testDoneFn();
    });

  });

  let userId = null;

  it('api/admin-get-aggregated-user-list (No Query)', testDoneFn => {

    callApi('api/admin-get-aggregated-user-list', {
      json: {
        apiKey: apiKey,
        userSearchString: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('userList').that.is.an('array');
      expect(body.userList.length).to.be.at.least(2);
      expect(body.userList[0]).to.have.property('organizationList').that.is.an('array');
      userId = body.userList[0].id;
      testDoneFn();
    });

  });
  
  it('api/admin-set-user-banning-status (Valid userId)', testDoneFn => {

    callApi('api/admin-set-user-banning-status', {
      json: {
        apiKey: apiKey,
        isBanned: true,
        userId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});