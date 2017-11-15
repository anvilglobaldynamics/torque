
let expect = require('chai').expect;

let { callApi } = require('./utils');

const email = `t${(new Date).getTime()}@gmail.com`
const password = "123545678"

describe.only('API', _ => {

  describe.only('user-register', _ => {

    it('api/user-register (Valid, Unique): ' + email, testDoneFn => {

      callApi('api/user-register', {
        json: {
          email,
          password
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
          password
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
          email,
          password
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
          password: 'short'
        }
      }, (err, response, body) => {
        expect(response.statusCode).to.equal(200)
        expect(body).to.have.property('hasError').that.equals(true)
        testDoneFn()
      })

    });

  });

  describe.only('user-login', _ => {

    it('api/user-login (Correct): ' + email, testDoneFn => {

      callApi('api/user-login', {
        json: {
          email,
          password
        }
      }, (err, response, body) => {
        expect(response.statusCode).to.equal(200);
        expect(body).to.have.property('hasError').that.equals(false);
        expect(body).to.have.property('status').that.equals('success');
        expect(body).to.have.property('apiKey').that.is.a('string')
        expect(body).to.have.property('sessionId').that.is.a('number')
        expect(body).to.have.property('warning').that.is.a('string').that.equals('You have less than 24 hours to verify your email address.')
        testDoneFn();
      })

    });

  });


});
