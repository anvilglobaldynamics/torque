let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  initializeServer,
  terminateServer,
  registerUser,
  loginUser
} = require('./lib');

const email = `t${(new Date).getTime()}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = 't' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');
const orgEmail = `o${(new Date).getTime()}@gmail.com`;
const orgPhone = 'o' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');
const customerPhone = 'o' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

let apiKey = null;

describe('add-customer', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      registerUser({
        email, password, fullName, phone
      }, _ => {
        setTimeout(_ => {
          loginUser({
            emailOrPhone: email, password
          }, (data) => {
            apiKey = data.apiKey;
            testDoneFn();
          });
        }, 100)
      });
    });
  });

  it('api/add-customer (Valid, Unique): ', testDoneFn => {

    callApi('api/add-customer', {
      json: {
        apiKey,
        organizationId: 0,
        fullName: "A Test Customer",
        phone: customerPhone,
        openingBalance: '500',
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it('api/add-customer (Valid, Not Unique): ', testDoneFn => {
    
    callApi('api/add-customer', {
      json: {
        apiKey,
        organizationId: 0,
        fullName: "Another Test Customer",
        phone: customerPhone,
        openingBalance: '500',
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('PHONE_ALREADY_IN_USE');
      testDoneFn();
    })

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});