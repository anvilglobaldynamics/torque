
let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  rnd,
  generateInvalidId,
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  validateOrganizationSchema
} = require('./lib');

const prefix = 's';

const email = `${rnd(prefix)}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = rnd(prefix, 11);

const orgEmail = 'o1' + `${rnd(prefix)}@gmail.com`;
const orgPhone = 'o1' + rnd(prefix, 11);
const org2Email = 'o2' + `${rnd(prefix)}@gmail.com`;
const org2Phone = 'o2' + rnd(prefix, 11);
const org3Phone = 'o3' + rnd(prefix, 11);

let apiKey = null;
let organizationList = null;

describe('organization', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      registerUser({
        email, password, fullName, phone
      }, _ => {
        loginUser({
          emailOrPhone: email, password
        }, (data) => {
          apiKey = data.apiKey;
          testDoneFn();
        });
      });
    });
  });

  it('api/add-organization (Valid)', testDoneFn => {

    callApi('api/add-organization', {
      json: {
        apiKey,
        name: "My Organization",
        primaryBusinessAddress: "My Address",
        phone: orgPhone,
        email: orgEmail
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it('api/add-organization (Invalid, copy phone)', testDoneFn => {

    callApi('api/add-organization', {
      json: {
        apiKey,
        name: "My Organization",
        primaryBusinessAddress: "My Address",
        phone: orgPhone,
        email: org2Email
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('PHONE_ALREADY_IN_USE');
      testDoneFn();
    })

  });

  it('api/add-organization (Invalid, copy email)', testDoneFn => {

    callApi('api/add-organization', {
      json: {
        apiKey,
        name: "My Organization",
        primaryBusinessAddress: "My Address",
        phone: org2Phone,
        email: orgEmail
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('EMAIL_ALREADY_IN_USE');
      testDoneFn();
    })

  });

  it('api/add-organization (Valid 2nd)', testDoneFn => {

    callApi('api/add-organization', {
      json: {
        apiKey,
        name: "My Organization 2",
        primaryBusinessAddress: "My Address",
        phone: org2Phone,
        email: org2Email
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it('api/get-organization-list (Valid)', testDoneFn => {

    callApi('api/get-organization-list', {
      json: {
        apiKey,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('organizationList').that.is.an('array');

      body.organizationList.forEach(organization => {
        validateOrganizationSchema(organization);
      });

      // expect(body.organizationList[0]).to.have.property('phone').that.equals(org2Phone);
      // expect(body.organizationList[0]).to.have.property('email').that.equals(org2Email);

      organizationList = body.organizationList;

      testDoneFn();
    });

  });

  it('api/edit-organization (Invalid, copy phone)', testDoneFn => {

    callApi('api/edit-organization', {
      json: {
        apiKey,
        organizationId: organizationList[0].id,
        name: organizationList[0].name,
        primaryBusinessAddress: organizationList[0].primaryBusinessAddress,
        phone: org2Phone,
        email: organizationList[0].email
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('PHONE_ALREADY_IN_USE');
      testDoneFn();
    });

  });

  it('api/edit-organization (Invalid, copy email)', testDoneFn => {

    callApi('api/edit-organization', {
      json: {
        apiKey,
        organizationId: organizationList[0].id,
        name: organizationList[0].name,
        primaryBusinessAddress: organizationList[0].primaryBusinessAddress,
        phone: organizationList[0].phone,
        email: org2Email
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('EMAIL_ALREADY_IN_USE');
      testDoneFn();
    });

  });

  it('api/edit-organization (Valid)', testDoneFn => {

    callApi('api/edit-organization', {
      json: {
        apiKey,
        organizationId: organizationList[0].id,
        name: organizationList[0].name,
        primaryBusinessAddress: organizationList[0].primaryBusinessAddress,
        phone: org3Phone,
        email: organizationList[0].email
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    });

  });

  it('api/get-organization-list (Valid modification check)', testDoneFn => {

    callApi('api/get-organization-list', {
      json: {
        apiKey,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('organizationList').that.is.an('array');

      body.organizationList.forEach(organization => {
        validateOrganizationSchema(organization);
      });

      expect(body.organizationList[0]).to.have.property('phone').that.equals(org3Phone);

      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});
