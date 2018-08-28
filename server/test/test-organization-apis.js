
let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  rnd,
  generateInvalidId,
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  validateOrganizationSchema,
  validateAddOrganizationApiSuccessResponse,
  validateGetOrganizationListApiSuccessResponse,
  validateGenericApiSuccessResponse
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
let organizationToBeEdited = null;

describe('Organization', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      registerUser({
        password, fullName, phone
      }, _ => {
        loginUser({
          emailOrPhone: phone, password
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
      validateAddOrganizationApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it.skip('api/add-organization (Invalid, copy phone)', testDoneFn => {

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

  it.skip('api/add-organization (Invalid, copy email)', testDoneFn => {

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
      validateAddOrganizationApiSuccessResponse(body);
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
      validateGetOrganizationListApiSuccessResponse(body);

      body.organizationList.forEach(organization => {
        validateOrganizationSchema(organization);
      });
      organizationToBeEdited = body.organizationList[0];

      testDoneFn();
    });

  });

  it.skip('api/edit-organization (Invalid, copy phone)', testDoneFn => {

    callApi('api/edit-organization', {
      json: {
        apiKey,
        organizationId: organizationToBeEdited.id,
        name: organizationToBeEdited.name,
        primaryBusinessAddress: organizationToBeEdited.primaryBusinessAddress,
        phone: org2Phone,
        email: organizationToBeEdited.email
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('PHONE_ALREADY_IN_USE');
      testDoneFn();
    });

  });

  it.skip('api/edit-organization (Invalid, copy email)', testDoneFn => {

    callApi('api/edit-organization', {
      json: {
        apiKey,
        organizationId: organizationToBeEdited.id,
        name: organizationToBeEdited.name,
        primaryBusinessAddress: organizationToBeEdited.primaryBusinessAddress,
        phone: organizationToBeEdited.phone,
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
        organizationId: organizationToBeEdited.id,
        name: organizationToBeEdited.name,
        primaryBusinessAddress: organizationToBeEdited.primaryBusinessAddress,
        phone: org3Phone,
        email: organizationToBeEdited.email
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
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
      validateGetOrganizationListApiSuccessResponse(body);

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
