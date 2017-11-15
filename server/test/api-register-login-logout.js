
let expect = require('chai').expect;

let { callApi } = require('./utils');

let { Program } = require('./../src/index');

let mainProgram = new Program({ allowUnsafeApis: false, muteLogger: true });

const email = `t${(new Date).getTime()}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = "01700889988";

describe('Server', _ => {
  it('Server should start without issues', testDoneFn => {
    mainProgram.initiateServer(_ => {
      testDoneFn();
    });
  });
});

describe('API', _ => {

  describe('user-register', _ => {

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

  });

  describe('user-login', _ => {

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
        testDoneFn();
      })

    });

  });


});

describe('Server', _ => {
  it('Server should close without issues', testDoneFn => {
    setTimeout(_ => mainProgram.terminateServer(), 300);
    testDoneFn();
  });
});