let expect = require('chai').expect;
let { callApi } = require('./utils');
let {
  delay,
  rnd,
  generateInvalidId,
  getDatabase,
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization,
  validateAdminFindOrganizationApiSuccessResponse,
  validateOrganizationSchema,
  validateGenericApiFailureResponse,
  validateAdminAssignPackageToOrganizationApiSuccessResponse,
  validateListOrganizationPackagesApiSuccessResponse,
  validatePackageActivationSchema
} = require('./lib');

const prefix = 'adm';

const adminUsername = "default";
const adminPassword = "johndoe1pass";

const phone = rnd(prefix, 11);
const email = `${rnd(prefix)}@rmail.com`;
const password = "123545678";
const fullName = "Test " + rnd(prefix, 11);
const fullName2 = "Test " + rnd(prefix, 11).split('').reverse().join('');
const phone2 = rnd(prefix, 11).split('').reverse().join('');
const newOrgOwnerPhone = 'o' + rnd(prefix, 11);
const newOrg1Phone = '1' + rnd(prefix, 11);
const newOrg2Phone = '2' + rnd(prefix, 11);
const newOrg1Email = '1' + `${rnd(prefix)}@gmail.com`;
const newOrg2Email = '2' + `${rnd(prefix)}@gmail.com`;
const unusedPhone = 'x' + rnd(prefix, 11);
const unusedEmail = 'x' + `${rnd(prefix)}@gmail.com`;

let invalidOrganizationId = generateInvalidId();

let apiKey = null;
let orgApiKey = null;
let org1id = null;
let org2id = null;
let packageActivationId = null;

describe('Admin', _ => {

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

  let apiKeyOfUserToBan = null

  it('intermittent (user creation)', testDoneFn => {
    registerUser({
      password, fullName, phone
    }, _ => {
      registerUser({
        password, fullName: fullName2, phone: phone2
      }, _ => {
        loginUser({
          emailOrPhone: phone, password
        }, (data) => {
          apiKeyOfUserToBan = data.apiKey;
          delay(200, _ => {
            testDoneFn();
          });
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
      expect(body.error).to.have.property('code').that.equals('OUTGOING_SMS_INVALID');
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

  // -- outgoing-email - start

  // ================================================== Edit Profile

  it('api/user-edit-profile', testDoneFn => {

    callApi('api/user-edit-profile', {
      json: {
        apiKey: apiKeyOfUserToBan,
        fullName: fullName,
        email: email,
        phone: phone,
        nid: '',
        physicalAddress: '',
        emergencyContact: '',
        bloodGroup: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  let outgoingEmailList = [];

  it('api/admin-get-outgoing-email-list (Valid Date)', testDoneFn => {

    let dateString = new Date().toISOString().slice(0, 10);
    let date = new Date(dateString).getTime();

    callApi('api/admin-get-outgoing-email-list', {
      json: {
        apiKey,
        date
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('outgoingEmailList').that.is.an('array');
      expect(body.outgoingEmailList.length > 0).to.equal(true);
      expect(body.outgoingEmailList.some(outgoingEmail => {
        return outgoingEmail.to === email;
      })).to.equal(true);
      outgoingEmailList = body.outgoingEmailList;
      testDoneFn();
    });

  });

  it('api/admin-set-outgoing-email-status (Valid SMS Id, status: sent)', testDoneFn => {

    let status = 'sent';
    let outgoingEmailId = outgoingEmailList.find(outgoingEmail => outgoingEmail.to === email).id;

    callApi('api/admin-set-outgoing-email-status', {
      json: {
        apiKey,
        status,
        outgoingEmailId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    });

  });

  it('api/admin-set-outgoing-email-status (Valid SMS Id, status: random)', testDoneFn => {

    let status = 'random';
    let outgoingEmailId = outgoingEmailList.find(outgoingEmail => outgoingEmail.to === email).id;

    callApi('api/admin-set-outgoing-email-status', {
      json: {
        apiKey,
        status,
        outgoingEmailId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('VALIDATION_ERROR');
      testDoneFn();
    });

  });

  it('api/admin-set-outgoing-email-status (Invalid SMS Id, status: sent)', testDoneFn => {

    let status = 'sent';
    let outgoingEmailId = 9559599;

    callApi('api/admin-set-outgoing-email-status', {
      json: {
        apiKey,
        status,
        outgoingEmailId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('OUTGOING_EMAIL_INVALID');
      testDoneFn();
    });

  });

  it('api/admin-set-outgoing-email-status (Invalid apiKey)', testDoneFn => {

    let status = 'sent';
    let outgoingEmailId = outgoingEmailList.find(outgoingEmail => outgoingEmail.to === email).id;

    callApi('api/admin-set-outgoing-email-status', {
      json: {
        apiKey: apiKey.split('').reverse().join(''),
        status,
        outgoingEmailId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('APIKEY_INVALID');
      testDoneFn();
    });

  });

  // -- outgoing-email - end

  it('api/admin-get-aggregated-user-list (phone)', testDoneFn => {

    callApi('api/admin-get-aggregated-user-list', {
      json: {
        apiKey: apiKey,
        userSearchString: phone,
        originType: 'any'
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
        userSearchString: fullName,
        originType: 'any'
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
        userSearchString: '',
        originType: 'any'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('userList').that.is.an('array');
      expect(body.userList.length).to.be.at.least(2);
      expect(body.userList[0]).to.have.property('organizationList').that.is.an('array');
      userId = body.userList.find(user => user.phone === phone).id;
      testDoneFn();
    });

  });

  it('api/admin-set-user-banning-status (Valid userId)', testDoneFn => {

    getDatabase().find('session', { apiKey: apiKeyOfUserToBan, hasExpired: false }, (err, docList) => {
      if (err) throw err;
      expect(docList.length).to.equal(1);
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
        getDatabase().find('session', { apiKey: apiKeyOfUserToBan, hasExpired: false }, (err, docList) => {
          if (err) throw err;
          expect(docList.length).to.equal(0);
          testDoneFn();
        });
      });
    });

  });

  // --- Payment System - start

  it('Organizations Creation', testDoneFn => {
    registerUser({
      password, fullName, phone: newOrgOwnerPhone
    }, _ => {
      loginUser({
        emailOrPhone: newOrgOwnerPhone, password
      }, (data) => {
        orgApiKey = data.apiKey;
        addOrganization({
          apiKey: orgApiKey,
          name: "Org Name 1",
          primaryBusinessAddress: "Dhaka, Bangladesh",
          phone: newOrg1Phone,
          email: newOrg1Email
        }, (data) => {
          org1id = data.organizationId;
          addOrganization({
            apiKey: orgApiKey,
            name: "Org Name 2",
            primaryBusinessAddress: "Dhaka, Bangladesh",
            phone: newOrg2Phone,
            email: newOrg2Email
          }, (data) => {
            org2id = data.organizationId;
            testDoneFn();
          });
        });
      });
    });
  });

  it('api/admin-get-organization (Valid)', testDoneFn => {

    callApi('api/admin-get-organization', {
      json: {
        apiKey,
        organizationId: org1id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAdminFindOrganizationApiSuccessResponse(body);
      validateOrganizationSchema(body.organization);
      testDoneFn();
    });

  });

  it('api/admin-get-organization (Invalid organizationId)', testDoneFn => {

    callApi('api/admin-get-organization', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('ORGANIZATION_INVALID');
      testDoneFn();
    });

  });

  it('api/admin-get-package-list', testDoneFn => {

    callApi('api/admin-get-package-list', {
      json: {
        apiKey
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('packageList').that.is.an('array');
      testDoneFn();
    });

  });

  it('api/admin-assign-package-to-organization (Valid)', testDoneFn => {

    callApi('api/admin-assign-package-to-organization', {
      json: {
        apiKey,
        organizationId: org1id,
        packageCode: "R-D01",
        paymentReference: "joi test"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAdminAssignPackageToOrganizationApiSuccessResponse(body);
      packageActivationId = body.packageActivationId;
      testDoneFn();
    });

  });

  it('api/admin-assign-package-to-organization (Invalid packageCode)', testDoneFn => {

    callApi('api/admin-assign-package-to-organization', {
      json: {
        apiKey,
        organizationId: org1id,
        packageCode: "Invalid",
        paymentReference: "joi test"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('PACKAGE_INVALID');
      testDoneFn();
    });

  });

  it('api/admin-assign-package-to-organization (Invalid organizationId)', testDoneFn => {

    callApi('api/admin-assign-package-to-organization', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId,
        packageCode: "R-SE03",
        paymentReference: "joi test"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('ORGANIZATION_DOES_NOT_EXIST');
      testDoneFn();
    });

  });

  it('api/admin-get-organization (valid assign package check)', testDoneFn => {

    callApi('api/admin-get-organization', {
      json: {
        apiKey,
        organizationId: org1id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAdminFindOrganizationApiSuccessResponse(body);
      validateOrganizationSchema(body.organization);
      expect(body.organization.packageActivationId).equal(packageActivationId);
      testDoneFn();
    });

  });

  it('api/admin-assign-package-to-organization (Valid update)', testDoneFn => {

    callApi('api/admin-assign-package-to-organization', {
      json: {
        apiKey,
        organizationId: org1id,
        packageCode: "R-U01",
        paymentReference: "joi test"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAdminAssignPackageToOrganizationApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/admin-list-organization-packages (Valid)', testDoneFn => {

    callApi('api/admin-list-organization-packages', {
      json: {
        apiKey,
        organizationId: org1id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateListOrganizationPackagesApiSuccessResponse(body);
      body.packageActivationList.forEach(packageActivation => {
        validatePackageActivationSchema(packageActivation);
      });
      testDoneFn();
    });

  });

  it('api/admin-set-module-activation-status (Invalid module)', testDoneFn => {

    callApi('api/admin-set-module-activation-status', {
      json: {
        apiKey,
        organizationId: org1id,
        moduleCode: "Crap",
        paymentReference: "joi test",
        action: 'activate'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('MODULE_INVALID');
      testDoneFn();
    });

  });

  it('api/admin-set-module-activation-status (Valid module)', testDoneFn => {

    callApi('api/admin-set-module-activation-status', {
      json: {
        apiKey,
        organizationId: org1id,
        moduleCode: "MOD_SELL_WAREHOUSE_PRODUCTS",
        paymentReference: "joi test",
        action: 'activate'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      testDoneFn();
    });

  });

  it('api/admin-get-module-list (Valid)', testDoneFn => {

    callApi('api/admin-get-module-list', {
      json: { apiKey }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      testDoneFn();
    });

  });

  // --- Payment System - end

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});