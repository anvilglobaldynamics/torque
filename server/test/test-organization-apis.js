
let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  rnd,
  getDatabase,
  generateInvalidId,
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  validateResponseOrganizationSchema,
  validateAddOrganizationApiSuccessResponse,
  validateGetOrganizationListApiSuccessResponse,
  validateGenericApiSuccessResponse,
  validateAdminAssignPackageToOrganizationApiSuccessResponse,
  validateListOrganizationPackagesApiSuccessResponse,
  validatePackageActivationSchema,
  validateGetDashboardSummaryApiSuccessResponse,
  validateAdminGetModuleListApiSuccessResponse,
  validateAdminListOrganizationModulesApiSuccessResponse,
  validateGenericApiFailureResponse
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
let org1id = null;
let org2id = null;
let adminApiKey = null;

const adminUsername = "default";
const adminPassword = "johndoe1pass";

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
      org1id = body.organizationId;
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
      org2id = body.organizationId;
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
        validateResponseOrganizationSchema(organization);
      });
      organizationToBeEdited = body.organizationList[0];

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
        validateResponseOrganizationSchema(organization);
      });

      expect(body.organizationList[0]).to.have.property('phone').that.equals(org3Phone);

      testDoneFn();
    });

  });

  // --- Organization Settings Section - start

  it('api/get-organization-list (Valid)', testDoneFn => {

    callApi('api/get-organization-list', {
      json: {
        apiKey,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetOrganizationListApiSuccessResponse(body);

      expect(body.organizationList[0].settings.receiptText1).to.equal('');
      expect(body.organizationList[0].settings.receiptText2).to.equal('');

      testDoneFn();
    });

  });

  it('api/edit-organization-settings (Valid)', testDoneFn => {

    callApi('api/edit-organization-settings', {
      json: {
        apiKey,
        organizationId: organizationToBeEdited.id,
        receiptText1: 'Test Change',
        receiptText2: '',
        logoImageId: null
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/get-organization-list (Valid modification check; not logged in check)', testDoneFn => {

    callApi('api/get-organization-list', {
      json: {
        apiKey,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body.hasError).to.equal(true);
      expect(body.error).to.have.property('code').that.equals('APIKEY_EXPIRED');
      testDoneFn();
    });

  });

  it('api/get-organization-list (Login again and Valid modification check)', testDoneFn => {

    loginUser({
      emailOrPhone: phone, password
    }, (data) => {
      apiKey = data.apiKey;

      callApi('api/get-organization-list', {
        json: {
          apiKey,
        }
      }, (err, response, body) => {
        expect(response.statusCode).to.equal(200);
        validateGetOrganizationListApiSuccessResponse(body);

        expect(body.organizationList[0].settings.receiptText1).to.equal('Test Change');
        expect(body.organizationList[0].settings.receiptText2).to.equal('');

        testDoneFn();
      });

    });

  });

  // --- Organization Settings Section - end

  // --- Package Section - start

  it('api/admin-login', testDoneFn => {

    callApi('api/admin-login', {
      json: {
        username: adminUsername,
        password: adminPassword
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      adminApiKey = body.apiKey;
      testDoneFn();
    })

  });

  it('api/admin-assign-package-to-organization (Valid)', testDoneFn => {

    callApi('api/admin-assign-package-to-organization', {
      json: {
        apiKey: adminApiKey,
        organizationId: org1id,
        packageCode: "R-D01",
        paymentReference: "joi test"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAdminAssignPackageToOrganizationApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/admin-assign-package-to-organization (Valid update)', testDoneFn => {

    callApi('api/admin-assign-package-to-organization', {
      json: {
        apiKey: adminApiKey,
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

  it('api/get-activated-package-list (Valid)', testDoneFn => {

    callApi('api/get-activated-package-list', {
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

  it('api/add-organization, api/get-dashboard-summary (Testing Default Activation Package)', testDoneFn => {

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
      organizationId = body.organizationId;

      callApi('api/get-dashboard-summary', {
        json: {
          apiKey,
          organizationId
        }
      }, (err, response, body) => {
        expect(response.statusCode).to.equal(200);
        validateGetDashboardSummaryApiSuccessResponse(body);

        let modifications = {
          $inc: { createdDatetimeStamp: (-1 * 1000 * 60 * 60 * 25) }
        };
        getDatabase().updateOne('package-activation', { organizationId: organizationId }, modifications, (err, wasUpdated) => {
          if (err) throw err;
          if (!wasUpdated) throw new Error("Was not updated");

          callApi('api/get-dashboard-summary', {
            json: {
              apiKey,
              organizationId
            }
          }, (err, response, body) => {
            expect(response.statusCode).to.equal(200);
            expect(body).to.have.property('hasError').that.equals(true);
            expect(body.error.code).to.equal("SUBSCRIPTION_EXPIRED");
            testDoneFn();
          }); // callApi

        }); // updateOne

      }); // callApi

    }); // callApi

  }); //it

  // --- Package Section - end

  // --- Module Section - start

  it('api/admin-login', testDoneFn => {

    callApi('api/admin-login', {
      json: {
        username: adminUsername,
        password: adminPassword
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      adminApiKey = body.apiKey;
      testDoneFn();
    })

  });

  it('api/admin-get-module-list (Valid)', testDoneFn => {

    callApi('api/admin-get-module-list', {
      json: {
        apiKey: adminApiKey,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAdminGetModuleListApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/admin-list-organization-modules (Valid)', testDoneFn => {

    callApi('api/admin-list-organization-modules', {
      json: {
        apiKey: adminApiKey,
        organizationId: org1id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAdminListOrganizationModulesApiSuccessResponse(body);
      expect(body.moduleActivationList.length).to.equal(3); // from default activation
      testDoneFn();
    });

  });

  it('api/admin-set-module-activation-status (Valid)', testDoneFn => {

    callApi('api/admin-set-module-activation-status', {
      json: {
        apiKey: adminApiKey,
        organizationId: org1id,
        moduleCode: 'MOD_PRODUCT',
        paymentReference: 'not-provided',
        action: 'deactivate'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body)
      testDoneFn();
    });

  });

  it('api/admin-list-organization-modules (Valid)', testDoneFn => {

    callApi('api/admin-list-organization-modules', {
      json: {
        apiKey: adminApiKey,
        organizationId: org1id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAdminListOrganizationModulesApiSuccessResponse(body);
      expect(body.moduleActivationList.length).to.equal(3); // from default activation
      expect(body.moduleActivationList.filter(i => i.isDeactivated).length).to.equal(1);
      testDoneFn();
    });

  });

  it('api/admin-set-module-activation-status (Valid)', testDoneFn => {

    callApi('api/admin-set-module-activation-status', {
      json: {
        apiKey: adminApiKey,
        organizationId: org1id,
        moduleCode: 'MOD_PRODUCT',
        paymentReference: 'Paid in full',
        action: 'activate'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body)
      testDoneFn();
    });

  });

  it('api/admin-list-organization-modules (Valid)', testDoneFn => {

    callApi('api/admin-list-organization-modules', {
      json: {
        apiKey: adminApiKey,
        organizationId: org1id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAdminListOrganizationModulesApiSuccessResponse(body);
      expect(body.moduleActivationList.length).to.equal(4); // 3 from default activation + 1 created above
      expect(body.moduleActivationList.filter(i => i.isDeactivated).length).to.equal(1);
      testDoneFn();
    });

  });

  it('api/admin-list-organization-modules (Invalid Organization)', testDoneFn => {

    callApi('api/admin-list-organization-modules', {
      json: {
        apiKey: adminApiKey,
        organizationId: -1
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('ORGANIZATION_INVALID');
      testDoneFn();
    });

  });

  it('api/admin-set-module-activation-status (Valid, MOD_GYM)', testDoneFn => {

    callApi('api/admin-set-module-activation-status', {
      json: {
        apiKey: adminApiKey,
        organizationId: org1id,
        moduleCode: 'MOD_GYM',
        paymentReference: 'Paid in full',
        action: 'activate'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body)
      testDoneFn();
    });

  });

  it('api/get-organization-list (User will be logged out)', testDoneFn => {

    callApi('api/get-organization-list', {
      json: {
        apiKey,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);

      testDoneFn();
    });
  });

  it('api/get-organization-list (Valid modification check, MOD_GYM)', testDoneFn => {

    loginUser({
      emailOrPhone: phone, password
    }, (data) => {
      apiKey = data.apiKey;

      callApi('api/get-organization-list', {
        json: {
          apiKey,
        }
      }, (err, response, body) => {
        expect(response.statusCode).to.equal(200);
        validateGetOrganizationListApiSuccessResponse(body);

        body.organizationList.forEach(organization => {
          validateResponseOrganizationSchema(organization);
        });

        let organization = body.organizationList.find(organization => organization.id === org1id);
        expect(organization.activeModuleCodeList.sort()).to.deep.equal(['MOD_PRODUCT', 'MOD_SERVICE', 'MOD_GYM', "MOD_ACCOUNTING"].sort());

        testDoneFn();
      });

    });

  });
  // --- Module Section - end

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});
