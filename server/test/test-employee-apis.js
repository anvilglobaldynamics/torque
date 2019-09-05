let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  rnd,
  generateInvalidId,
  initializeServer,
  terminateServer,
  registerUser,
  editUser,
  loginUser,
  loginOut,
  addOrganization,
  validateUserSchema,
  validateEmploymentSchema,
  validateHireUserAsEmployeeApiSuccessResponse,
  validateGenericApiFailureResponse,
  validateFindUserApiSuccessResponse,
  validateAddNewEmployeeApiSuccessResponse,
  validateGetEmployeeListApiSuccessResponse,
  validateGetEmployeeApiSuccessResponse,
  validateGenericApiSuccessResponse
} = require('./lib');

const prefix = 's';

const email = `${rnd(prefix)}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = rnd(prefix, 11);

const firstEmpEmail = 'e1' + `${rnd(prefix)}@gmail.com`;
const firstEmpPassword = "123545678";
const firstEmpFullName = "Test Employee";
const firstEmpPhone = 'e1' + rnd(prefix, 11);

const secondEmpEmail = 'e2' + `${rnd(prefix)}@gmail.com`;
const secondEmpPassword = "123545678";
const secondEmpFullName = "Test Employee";
const secondEmpPhone = 'e2' + rnd(prefix, 11);

const thirdEmpEmail = 'e3' + `${rnd(prefix)}@gmail.com`;
const thirdEmpPassword = "123545678";
const thirdEmpFullName = "Test Employee";
const thirdEmpPhone = 'e3' + rnd(prefix, 11);

const orgEmail = 'o1' + `${rnd(prefix)}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "My Address";
const orgPhone = 'o1' + rnd(prefix, 11);

const privilegeObject = {
  PRIV_VIEW_USERS: true,
  PRIV_MODIFY_USERS: true,

  PRIV_ACCESS_POS: true,
  PRIV_VIEW_SALES: true,
  PRIV_MODIFY_SALES: true,
  PRIV_ALLOW_FLEXIBLE_PRICE: true,
  PRIV_VIEW_PURCHASE_PRICE: true,
  PRIV_MODIFY_DISCOUNT_PRESETS: true,

  PRIV_VIEW_SALES_RETURN: true,
  PRIV_MODIFY_SALES_RETURN: true,

  PRIV_VIEW_ALL_INVENTORIES: true,
  PRIV_VIEW_ALL_SERVICES: true,
  PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS: true,
  PRIV_MODIFY_ALL_SERVICE_BLUEPRINTS: true,
  PRIV_VIEW_ALL_SERVICE_BLUEPRINTS: true,
  PRIV_VIEW_ALL_PRODUCT_BLUEPRINTS: true,
  PRIV_TRANSFER_ALL_INVENTORIES: true,
  PRIV_ADD_PRODUCTS_TO_ALL_INVENTORIES: true,
  PRIV_MODIFY_ALL_SERVICES_AVAILABILITY_IN_ALL_OUTLETS: true,

  PRIV_VIEW_ALL_SERVICE_MEMBERSHIPS: true,
  PRIV_MODIFY_ALL_SERVICE_MEMBERSHIPS: true,

  PRIV_VIEW_ALL_OUTLETS: true,
  PRIV_MODIFY_ALL_OUTLETS: true,

  PRIV_VIEW_ALL_WAREHOUSES: true,
  PRIV_MODIFY_ALL_WAREHOUSES: true,

  PRIV_VIEW_ORGANIZATION_STATISTICS: true,
  PRIV_MODIFY_ORGANIZATION: true,

  PRIV_VIEW_CUSTOMER: true,
  PRIV_MODIFY_CUSTOMER: true,
  PRIV_MANAGE_CUSTOMER_WALLET_BALANCE: true,

  PRIV_VIEW_VENDOR: true,
  PRIV_MODIFY_VENDOR: true,

  PRIV_VIEW_REPORTS: true,

  MODIFY_ORGANIZATION_SETTINGS: true
};

let apiKey = null;
let organizationId = null;
let employeeId = null;
let employmentId = null;
let employeeToBeEditedData = null;
let employeeToBeRehired = null;
let invalidUserId = generateInvalidId();
let invalidEmploymentId = generateInvalidId();
let invalidOrganizationId = generateInvalidId();

describe.only('Employee', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      registerUser({
        password, fullName, phone
      }, _ => {
        loginUser({
          emailOrPhone: phone, password
        }, (data) => {
          apiKey = data.apiKey;
          addOrganization({
            apiKey,
            name: orgName,
            primaryBusinessAddress: orgBusinessAddress,
            phone: orgPhone,
            email: orgEmail
          }, (data) => {
            organizationId = data.organizationId;
            registerUser({
              password: firstEmpPassword,
              fullName: firstEmpFullName,
              phone: firstEmpPhone
            }, (data) => {
              employeeId = data.userId;
              loginOut({
                apiKey
              }, (data) => {
                loginUser({
                  emailOrPhone: firstEmpPhone, password: firstEmpPassword
                }, (data) => {
                  apiKey = data.apiKey;
                  editUser({
                    apiKey,
                    fullName: firstEmpFullName,
                    email: firstEmpEmail,
                    phone: firstEmpPhone,
                    nid: '',
                    physicalAddress: '',
                    emergencyContact: '',
                    bloodGroup: ''
                  }, (data) => {
                    loginOut({
                      apiKey
                    }, (data) => {
                      loginUser({
                        emailOrPhone: phone, password
                      }, (data) => {
                        apiKey = data.apiKey;
                        testDoneFn();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  it('api/hire-user-as-employee (Invalid organization)', testDoneFn => {

    callApi('api/hire-user-as-employee', {
      json: {
        apiKey,
        userId: employeeId,
        organizationId: invalidOrganizationId,
        role: "Joi.string().max(1024).required()",
        designation: "Joi.string().max(1024).required()",
        companyProvidedId: "abc123",
        privileges: privilegeObject
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('ORGANIZATION_INVALID');
      testDoneFn();
    })

  });

  it('api/hire-user-as-employee (Valid, all privileges)', testDoneFn => {

    callApi('api/hire-user-as-employee', {
      json: {
        apiKey,
        userId: employeeId,
        organizationId,
        role: "Joi.string().max(1024).required()",
        designation: "Joi.string().max(1024).required()",
        companyProvidedId: "abc123",
        privileges: privilegeObject
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateHireUserAsEmployeeApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/get-user-display-information (Valid)', testDoneFn => {

    callApi('api/get-user-display-information', {
      json: {
        apiKey,
        userId: employeeId,
        organizationId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      // NOTE: It is validated unorthodoxly since the results need to be matched exactly
      let knownResult = {
        "hasError": false,
        userDisplayInformation:
        {
          fullName: 'Test Employee',
          email: firstEmpEmail,
          phone: firstEmpPhone,
          designation: 'Joi.string().max(1024).required()',
          role: 'Joi.string().max(1024).required()',
          companyProvidedId: 'abc123',
          isActive: true
        }
      }
      expect(knownResult).to.deep.equal(body)
      testDoneFn();
    })

  });

  it('api/get-user-display-information (Invalid userId)', testDoneFn => {

    callApi('api/get-user-display-information', {
      json: {
        apiKey,
        userId: -1,
        organizationId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('USER_INVALID');
      testDoneFn();
    })

  });

  it('api/get-user-display-information (Invalid organizationId)', testDoneFn => {

    callApi('api/get-user-display-information', {
      json: {
        apiKey,
        userId: employeeId,
        organizationId: -1,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('ORGANIZATION_INVALID');
      testDoneFn();
    })

  });

  it('api/hire-user-as-employee (Invalid, already employed)', testDoneFn => {

    callApi('api/hire-user-as-employee', {
      json: {
        apiKey,
        userId: employeeId,
        organizationId,
        role: "Joi.string().max(1024).required()",
        designation: "Joi.string().max(1024).required()",
        companyProvidedId: "abc123",
        privileges: privilegeObject
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('ALREADY_EMPLOYED');
      testDoneFn();
    })

  });

  it('api/hire-user-as-employee (Invalid user)', testDoneFn => {

    callApi('api/hire-user-as-employee', {
      json: {
        apiKey,
        userId: invalidUserId,
        organizationId,
        role: "Joi.string().max(1024).required()",
        designation: "Joi.string().max(1024).required()",
        companyProvidedId: "abc123",
        privileges: privilegeObject
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('USER_INVALID');
      testDoneFn();
    })

  });

  it('api/find-user (Valid phone)', testDoneFn => {

    callApi('api/find-user', {
      json: {
        apiKey,
        emailOrPhone: firstEmpPhone
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateFindUserApiSuccessResponse(body);
      validateUserSchema(body.user);
      testDoneFn();
    })

  });

  it('api/find-user (Valid email)', testDoneFn => {

    callApi('api/find-user', {
      json: {
        apiKey,
        emailOrPhone: firstEmpEmail
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateFindUserApiSuccessResponse(body);
      validateUserSchema(body.user);
      testDoneFn();
    })

  });

  // TODO: below needs better validation
  it('api/find-user (Invalid emailOrPhone)', testDoneFn => {

    callApi('api/find-user', {
      json: {
        apiKey,
        emailOrPhone: 'invalid emailOrPhone'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('VALIDATION_ERROR');
      testDoneFn();
    })

  });

  it('api/find-user (Unused email)', testDoneFn => {

    callApi('api/find-user', {
      json: {
        apiKey,
        emailOrPhone: 'unusedemail@email.com'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('USER_DOES_NOT_EXIST');
      testDoneFn();
    })

  });

  it('api/find-user (Unused phone)', testDoneFn => {

    callApi('api/find-user', {
      json: {
        apiKey,
        emailOrPhone: '99999999999'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('USER_DOES_NOT_EXIST');
      testDoneFn();
    })

  });

  it('api/add-new-employee (Invalid, no privileges)', testDoneFn => {

    callApi('api/add-new-employee', {
      json: {
        apiKey,

        fullName: secondEmpFullName,
        phone: secondEmpPhone,
        password: secondEmpPassword,

        organizationId,
        role: "Joi.string().max(1024).required()",
        designation: "Joi.string().max(1024).required()",
        companyProvidedId: "abc123",
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('VALIDATION_ERROR');
      testDoneFn();
    })

  });

  it('api/add-new-employee (Valid, all privileges)', testDoneFn => {

    callApi('api/add-new-employee', {
      json: {
        apiKey,

        fullName: secondEmpFullName,
        phone: secondEmpPhone,
        password: secondEmpPassword,

        organizationId,
        role: "Joi.string().max(1024).required()",
        designation: "Joi.string().max(1024).required()",
        companyProvidedId: "abc123",

        privileges: privilegeObject
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddNewEmployeeApiSuccessResponse(body);
      employmentId = body.employmentId;
      testDoneFn();
    })

  });

  it('api/add-new-employee (Copy phone)', testDoneFn => {

    callApi('api/add-new-employee', {
      json: {
        apiKey,

        fullName: thirdEmpFullName,
        phone: secondEmpPhone,
        password: thirdEmpPassword,

        organizationId,
        role: "Joi.string().max(1024).required()",
        designation: "Joi.string().max(1024).required()",
        companyProvidedId: "abc123",

        privileges: privilegeObject
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('PHONE_ALREADY_IN_USE');
      testDoneFn();
    })

  });

  it('api/add-new-employee (Invalid organization)', testDoneFn => {

    callApi('api/add-new-employee', {
      json: {
        apiKey,

        fullName: thirdEmpFullName,
        phone: thirdEmpPhone,
        password: thirdEmpPassword,

        organizationId: invalidOrganizationId,
        role: "Joi.string().max(1024).required()",
        designation: "Joi.string().max(1024).required()",
        companyProvidedId: "abc123",

        privileges: privilegeObject
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('ORGANIZATION_INVALID');
      testDoneFn();
    })

  });

  it('api/get-employee-list (Valid)', testDoneFn => {

    callApi('api/get-employee-list', {
      json: {
        apiKey,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetEmployeeListApiSuccessResponse(body);
      body.employeeList.forEach(employee => {
        validateEmploymentSchema(employee);
      });
      testDoneFn();
    })

  });

  it('api/get-employee-list (Valid searchString)', testDoneFn => {

    callApi('api/get-employee-list', {
      json: {
        apiKey,
        organizationId,
        searchString: 'user'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetEmployeeListApiSuccessResponse(body);
      body.employeeList.forEach(employee => {
        validateEmploymentSchema(employee);
      });
      testDoneFn();
    })

  });

  it('api/get-employee-list (Invalid organizationId)', testDoneFn => {

    callApi('api/get-employee-list', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('ORGANIZATION_INVALID');
      testDoneFn();
    })

  });

  it('api/get-employee (Valid)', testDoneFn => {

    callApi('api/get-employee', {
      json: {
        apiKey,
        employmentId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetEmployeeApiSuccessResponse(body);
      validateEmploymentSchema(body.employee);
      employeeToBeEditedData = body.employee;
      testDoneFn();
    })

  });

  it('api/get-employee (Invalid)', testDoneFn => {

    callApi('api/get-employee', {
      json: {
        apiKey,
        employmentId: invalidEmploymentId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('EMPLOYEE_INVALID');
      testDoneFn();
    })

  });

  it('api/edit-employment (Valid)', testDoneFn => {

    callApi('api/edit-employment', {
      json: {
        apiKey,

        employmentId: employeeToBeEditedData.id,

        isActive: employeeToBeEditedData.isActive,

        role: employeeToBeEditedData.role,
        designation: employeeToBeEditedData.designation,
        companyProvidedId: "007",

        privileges: employeeToBeEditedData.privileges
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/get-employee (Valid Modification check)', testDoneFn => {

    callApi('api/get-employee', {
      json: {
        apiKey,
        employmentId: employeeToBeEditedData.id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetEmployeeApiSuccessResponse(body);
      validateEmploymentSchema(body.employee);
      expect(body.employee).to.have.property('companyProvidedId').that.equals("007");
      testDoneFn();
    })

  });

  it('api/edit-employment (Invalid)', testDoneFn => {

    callApi('api/edit-employment', {
      json: {
        apiKey,

        employmentId: invalidEmploymentId,

        isActive: false,

        role: employeeToBeEditedData.role,
        designation: employeeToBeEditedData.designation,
        companyProvidedId: employeeToBeEditedData.companyProvidedId,

        privileges: employeeToBeEditedData.privileges
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('EMPLOYEE_INVALID');
      testDoneFn();
    })

  });

  it('api/fire-employee (Valid)', testDoneFn => {

    callApi('api/fire-employee', {
      json: {
        apiKey,
        employmentId: employeeToBeEditedData.id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/get-employee (Valid sack check)', testDoneFn => {

    callApi('api/get-employee', {
      json: {
        apiKey,
        employmentId: employeeToBeEditedData.id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetEmployeeApiSuccessResponse(body);
      validateEmploymentSchema(body.employee);
      expect(body.employee).to.have.property('isActive').that.equals(false);
      employeeToBeRehired = body.employee;
      testDoneFn();
    })

  });

  it('api/fire-employee (Inalid)', testDoneFn => {

    callApi('api/fire-employee', {
      json: {
        apiKey,
        employmentId: invalidEmploymentId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('EMPLOYEE_INVALID');
      testDoneFn();
    })

  });

  it('api/hire-user-as-employee (Valid, rehire)', testDoneFn => {

    callApi('api/hire-user-as-employee', {
      json: {
        apiKey,
        userId: employeeToBeRehired.userId,
        organizationId,
        role: "Joi.string().max(1024).required()",
        designation: "Joi.string().max(1024).required()",
        companyProvidedId: "abc123",
        privileges: privilegeObject
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateHireUserAsEmployeeApiSuccessResponse(body);
      employmentId = body.employmentId;
      testDoneFn();
    })

  });

  it('api/get-employee (Valid rehire check)', testDoneFn => {

    callApi('api/get-employee', {
      json: {
        apiKey,
        employmentId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetEmployeeApiSuccessResponse(body);
      validateEmploymentSchema(body.employee);
      expect(body.employee).to.have.property('isActive').that.equals(true);
      testDoneFn();
    })

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});