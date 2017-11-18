
let expect = require('chai').expect;
let { callApi } = require('./utils');
let {
  initializeServer,
  terminateServer
} = require('./lib');

const email = `t1${(new Date).getTime()}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = 't1' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

let apiKey = null;

describe('API', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      testDoneFn();
    });
  });

  // ================================================== Register

  it('api/user-register (Valid, Unique): ' + email, testDoneFn => {

    callApi('api/user-register', {
      json: {
        email,
        password,
        phone,
        fullName
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200)
      expect(body).to.have.property('hasError').that.equals(false)
      expect(body).to.have.property('status').that.equals('success')
      testDoneFn()
    })

  });

  it('api/user-register (Valid, Not Unique): ' + email, testDoneFn => {

    callApi('api/user-register', {
      json: {
        email,
        password,
        phone,
        fullName
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200)
      expect(body).to.have.property('hasError').that.equals(true)
      testDoneFn()
    })

  });

  it('api/user-register (Invalid Email): ' + email + '%', testDoneFn => {

    callApi('api/user-register', {
      json: {
        email: (email + '%'),
        password,
        phone,
        fullName
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200)
      expect(body).to.have.property('hasError').that.equals(true)
      testDoneFn()
    })

  });

  it('api/user-register (Invalid Password): ' + email, testDoneFn => {

    callApi('api/user-register', {
      json: {
        email,
        password: 'short',
        phone,
        fullName
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200)
      expect(body).to.have.property('hasError').that.equals(true)
      testDoneFn()
    })

  });

  // ================================================== Login

  it('api/user-login (Correct, Using Email): ' + email, testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: email,
        password
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string')
      expect(body).to.have.property('sessionId').that.is.a('number')
      expect(body).to.have.property('warning').that.is.a('string').that.equals('You have less than 24 hours to verify your email address.')
      expect(body).to.have.property('user').that.is.an('object')

      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  // ================================================== Logout

  it('api/user-logout (Correct): ' + email, testDoneFn => {

    callApi('api/user-logout', {
      json: {
        apiKey
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

