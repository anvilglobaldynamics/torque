let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  rnd,
  generateInvalidId,
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization,
  validateUserSchema,
  validateEmploymentSchema
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

let apiKey = null;
let organizationId = null;
let employeeId = null;
let employmentId = null;
let employeeToBeEditedData = null;
let invalidUserId = generateInvalidId();
let invalidEmploymentId = generateInvalidId();
let invalidOrganizationId = generateInvalidId();

describe('employee', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      registerUser({
        email, password, fullName, phone
      }, _ => {
        loginUser({
          emailOrPhone: email, password
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
              email: firstEmpEmail,
              password: firstEmpPassword,
              fullName: firstEmpFullName,
              phone: firstEmpPhone
            }, (data) => {
              employeeId = data.userId;
              testDoneFn();
            });
          });
        });
      });
    });
  });

  it.skip('api/hire-user-as-employee (Invalid organization)', testDoneFn => {

    callApi('api/hire-user-as-employee', {
      json: {
        apiKey,
        userId: employeeId,
        organizationId: invalidOrganizationId,
        role: "Joi.string().max(1024).required()",
        designation: "Joi.string().max(1024).required()",
        companyProvidedId: "abc123",
        privileges: {
          PRIV_VIEW_USERS: true,
          PRIV_MODIFY_USERS: true,
          PRIV_ADD_USER: true,
          PRIV_MAKE_USER_AN_OWNER: true,
          PRIV_MODIFY_USER_PRIVILEGES: true,

          PRIV_ACCESS_POS: true,
          PRIV_VIEW_SALES: true,
          PRIV_MODIFY_SALES: true,
          PRIV_ALLOW_FLAT_DISCOUNT: true,
          PRIV_ALLOW_INDIVIDUAL_DISCOUNT: true,
          PRIV_ALLOW_FOC: true,

          PRIV_VIEW_SALES_RETURN: true,
          PRIV_MODIFY_SALES_RETURN: true,

          PRIV_VIEW_ALL_INVENTORIES: true,
          PRIV_MODIFY_ALL_INVENTORIES: true,
          PRIV_TRANSFER_ALL_INVENTORIES: true,
          PRIV_REPORT_DAMAGES_IN_ALL_INVENTORIES: true,

          PRIV_VIEW_ALL_OUTLETS: true,
          PRIV_MODIFY_ALL_OUTLETS: true,

          PRIV_VIEW_ALL_WAREHOUSES: true,
          PRIV_MODIFY_ALL_WAREHOUSES: true,

          PRIV_VIEW_ORGANIZATION_STATISTICS: true,
          PRIV_MODIFY_ORGANIZATION: true,

          PRIV_VIEW_CUSTOMER: true,
          PRIV_ADD_CUSTOMER_DURING_SALES: true,
          PRIV_MODIFY_CUSTOMER: true,
          PRIV_MANAGE_CUSTOMER_DEBT: true
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('ORGANIZATION_INVALID');

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
        privileges: {
          PRIV_VIEW_USERS: true,
          PRIV_MODIFY_USERS: true,
          PRIV_ADD_USER: true,
          PRIV_MAKE_USER_AN_OWNER: true,
          PRIV_MODIFY_USER_PRIVILEGES: true,

          PRIV_ACCESS_POS: true,
          PRIV_VIEW_SALES: true,
          PRIV_MODIFY_SALES: true,
          PRIV_ALLOW_FLAT_DISCOUNT: true,
          PRIV_ALLOW_INDIVIDUAL_DISCOUNT: true,
          PRIV_ALLOW_FOC: true,

          PRIV_VIEW_SALES_RETURN: true,
          PRIV_MODIFY_SALES_RETURN: true,

          PRIV_VIEW_ALL_INVENTORIES: true,
          PRIV_MODIFY_ALL_INVENTORIES: true,
          PRIV_TRANSFER_ALL_INVENTORIES: true,
          PRIV_REPORT_DAMAGES_IN_ALL_INVENTORIES: true,

          PRIV_VIEW_ALL_OUTLETS: true,
          PRIV_MODIFY_ALL_OUTLETS: true,

          PRIV_VIEW_ALL_WAREHOUSES: true,
          PRIV_MODIFY_ALL_WAREHOUSES: true,

          PRIV_VIEW_ORGANIZATION_STATISTICS: true,
          PRIV_MODIFY_ORGANIZATION: true,

          PRIV_VIEW_CUSTOMER: true,
          PRIV_ADD_CUSTOMER_DURING_SALES: true,
          PRIV_MODIFY_CUSTOMER: true,
          PRIV_MANAGE_CUSTOMER_DEBT: true
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('employmentId');

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
        privileges: {
          PRIV_VIEW_USERS: true,
          PRIV_MODIFY_USERS: true,
          PRIV_ADD_USER: true,
          PRIV_MAKE_USER_AN_OWNER: true,
          PRIV_MODIFY_USER_PRIVILEGES: true,

          PRIV_ACCESS_POS: true,
          PRIV_VIEW_SALES: true,
          PRIV_MODIFY_SALES: true,
          PRIV_ALLOW_FLAT_DISCOUNT: true,
          PRIV_ALLOW_INDIVIDUAL_DISCOUNT: true,
          PRIV_ALLOW_FOC: true,

          PRIV_VIEW_SALES_RETURN: true,
          PRIV_MODIFY_SALES_RETURN: true,

          PRIV_VIEW_ALL_INVENTORIES: true,
          PRIV_MODIFY_ALL_INVENTORIES: true,
          PRIV_TRANSFER_ALL_INVENTORIES: true,
          PRIV_REPORT_DAMAGES_IN_ALL_INVENTORIES: true,

          PRIV_VIEW_ALL_OUTLETS: true,
          PRIV_MODIFY_ALL_OUTLETS: true,

          PRIV_VIEW_ALL_WAREHOUSES: true,
          PRIV_MODIFY_ALL_WAREHOUSES: true,

          PRIV_VIEW_ORGANIZATION_STATISTICS: true,
          PRIV_MODIFY_ORGANIZATION: true,

          PRIV_VIEW_CUSTOMER: true,
          PRIV_ADD_CUSTOMER_DURING_SALES: true,
          PRIV_MODIFY_CUSTOMER: true,
          PRIV_MANAGE_CUSTOMER_DEBT: true
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('ALREADY_EMPLOYED');

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
        privileges: {
          PRIV_VIEW_USERS: true,
          PRIV_MODIFY_USERS: true,
          PRIV_ADD_USER: true,
          PRIV_MAKE_USER_AN_OWNER: true,
          PRIV_MODIFY_USER_PRIVILEGES: true,

          PRIV_ACCESS_POS: true,
          PRIV_VIEW_SALES: true,
          PRIV_MODIFY_SALES: true,
          PRIV_ALLOW_FLAT_DISCOUNT: true,
          PRIV_ALLOW_INDIVIDUAL_DISCOUNT: true,
          PRIV_ALLOW_FOC: true,

          PRIV_VIEW_SALES_RETURN: true,
          PRIV_MODIFY_SALES_RETURN: true,

          PRIV_VIEW_ALL_INVENTORIES: true,
          PRIV_MODIFY_ALL_INVENTORIES: true,
          PRIV_TRANSFER_ALL_INVENTORIES: true,
          PRIV_REPORT_DAMAGES_IN_ALL_INVENTORIES: true,

          PRIV_VIEW_ALL_OUTLETS: true,
          PRIV_MODIFY_ALL_OUTLETS: true,

          PRIV_VIEW_ALL_WAREHOUSES: true,
          PRIV_MODIFY_ALL_WAREHOUSES: true,

          PRIV_VIEW_ORGANIZATION_STATISTICS: true,
          PRIV_MODIFY_ORGANIZATION: true,

          PRIV_VIEW_CUSTOMER: true,
          PRIV_ADD_CUSTOMER_DURING_SALES: true,
          PRIV_MODIFY_CUSTOMER: true,
          PRIV_MANAGE_CUSTOMER_DEBT: true
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('USER_INVALID');

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('user');

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('user');

      validateUserSchema(body.user);

      testDoneFn();
    })

  });

  it('api/find-user (Invalid email)', testDoneFn => {

    callApi('api/find-user', {
      json: {
        apiKey,
        emailOrPhone: 'test@test.com'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('USER_DOES_NOT_EXIST');

      testDoneFn();
    })

  });

  it('api/find-user (Invalid phone)', testDoneFn => {

    callApi('api/find-user', {
      json: {
        apiKey,
        emailOrPhone: '01726404040'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('USER_DOES_NOT_EXIST');

      testDoneFn();
    })

  });

  it('api/add-new-employee (Valid, all privileges)', testDoneFn => {

    callApi('api/add-new-employee', {
      json: {
        apiKey,

        email: secondEmpEmail,
        fullName: secondEmpFullName,
        phone: secondEmpPhone,
        password: secondEmpPassword,

        organizationId,
        role: "Joi.string().max(1024).required()",
        designation: "Joi.string().max(1024).required()",
        companyProvidedId: "abc123",

        privileges: {
          PRIV_VIEW_USERS: true,
          PRIV_MODIFY_USERS: true,
          PRIV_ADD_USER: true,
          PRIV_MAKE_USER_AN_OWNER: true,
          PRIV_MODIFY_USER_PRIVILEGES: true,

          PRIV_ACCESS_POS: true,
          PRIV_VIEW_SALES: true,
          PRIV_MODIFY_SALES: true,
          PRIV_ALLOW_FLAT_DISCOUNT: true,
          PRIV_ALLOW_INDIVIDUAL_DISCOUNT: true,
          PRIV_ALLOW_FOC: true,

          PRIV_VIEW_SALES_RETURN: true,
          PRIV_MODIFY_SALES_RETURN: true,

          PRIV_VIEW_ALL_INVENTORIES: true,
          PRIV_MODIFY_ALL_INVENTORIES: true,
          PRIV_TRANSFER_ALL_INVENTORIES: true,
          PRIV_REPORT_DAMAGES_IN_ALL_INVENTORIES: true,

          PRIV_VIEW_ALL_OUTLETS: true,
          PRIV_MODIFY_ALL_OUTLETS: true,

          PRIV_VIEW_ALL_WAREHOUSES: true,
          PRIV_MODIFY_ALL_WAREHOUSES: true,

          PRIV_VIEW_ORGANIZATION_STATISTICS: true,
          PRIV_MODIFY_ORGANIZATION: true,

          PRIV_VIEW_CUSTOMER: true,
          PRIV_ADD_CUSTOMER_DURING_SALES: true,
          PRIV_MODIFY_CUSTOMER: true,
          PRIV_MANAGE_CUSTOMER_DEBT: true
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('userId');
      expect(body).to.have.property('employmentId');

      employmentId = body.employmentId;

      testDoneFn();
    })

  });

  it('api/add-new-employee (Invalid email)', testDoneFn => {

    callApi('api/add-new-employee', {
      json: {
        apiKey,

        email: firstEmpEmail,
        fullName: thirdEmpFullName,
        phone: thirdEmpPhone,
        password: thirdEmpPassword,

        organizationId,
        role: "Joi.string().max(1024).required()",
        designation: "Joi.string().max(1024).required()",
        companyProvidedId: "abc123",

        privileges: {
          PRIV_VIEW_USERS: true,
          PRIV_MODIFY_USERS: true,
          PRIV_ADD_USER: true,
          PRIV_MAKE_USER_AN_OWNER: true,
          PRIV_MODIFY_USER_PRIVILEGES: true,

          PRIV_ACCESS_POS: true,
          PRIV_VIEW_SALES: true,
          PRIV_MODIFY_SALES: true,
          PRIV_ALLOW_FLAT_DISCOUNT: true,
          PRIV_ALLOW_INDIVIDUAL_DISCOUNT: true,
          PRIV_ALLOW_FOC: true,

          PRIV_VIEW_SALES_RETURN: true,
          PRIV_MODIFY_SALES_RETURN: true,

          PRIV_VIEW_ALL_INVENTORIES: true,
          PRIV_MODIFY_ALL_INVENTORIES: true,
          PRIV_TRANSFER_ALL_INVENTORIES: true,
          PRIV_REPORT_DAMAGES_IN_ALL_INVENTORIES: true,

          PRIV_VIEW_ALL_OUTLETS: true,
          PRIV_MODIFY_ALL_OUTLETS: true,

          PRIV_VIEW_ALL_WAREHOUSES: true,
          PRIV_MODIFY_ALL_WAREHOUSES: true,

          PRIV_VIEW_ORGANIZATION_STATISTICS: true,
          PRIV_MODIFY_ORGANIZATION: true,

          PRIV_VIEW_CUSTOMER: true,
          PRIV_ADD_CUSTOMER_DURING_SALES: true,
          PRIV_MODIFY_CUSTOMER: true,
          PRIV_MANAGE_CUSTOMER_DEBT: true
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('EMAIL_ALREADY_IN_USE');

      testDoneFn();
    })

  });

  it('api/add-new-employee (Invalid phone)', testDoneFn => {

    callApi('api/add-new-employee', {
      json: {
        apiKey,

        email: thirdEmpEmail,
        fullName: thirdEmpFullName,
        phone: secondEmpPhone,
        password: thirdEmpPassword,

        organizationId,
        role: "Joi.string().max(1024).required()",
        designation: "Joi.string().max(1024).required()",
        companyProvidedId: "abc123",

        privileges: {
          PRIV_VIEW_USERS: true,
          PRIV_MODIFY_USERS: true,
          PRIV_ADD_USER: true,
          PRIV_MAKE_USER_AN_OWNER: true,
          PRIV_MODIFY_USER_PRIVILEGES: true,

          PRIV_ACCESS_POS: true,
          PRIV_VIEW_SALES: true,
          PRIV_MODIFY_SALES: true,
          PRIV_ALLOW_FLAT_DISCOUNT: true,
          PRIV_ALLOW_INDIVIDUAL_DISCOUNT: true,
          PRIV_ALLOW_FOC: true,

          PRIV_VIEW_SALES_RETURN: true,
          PRIV_MODIFY_SALES_RETURN: true,

          PRIV_VIEW_ALL_INVENTORIES: true,
          PRIV_MODIFY_ALL_INVENTORIES: true,
          PRIV_TRANSFER_ALL_INVENTORIES: true,
          PRIV_REPORT_DAMAGES_IN_ALL_INVENTORIES: true,

          PRIV_VIEW_ALL_OUTLETS: true,
          PRIV_MODIFY_ALL_OUTLETS: true,

          PRIV_VIEW_ALL_WAREHOUSES: true,
          PRIV_MODIFY_ALL_WAREHOUSES: true,

          PRIV_VIEW_ORGANIZATION_STATISTICS: true,
          PRIV_MODIFY_ORGANIZATION: true,

          PRIV_VIEW_CUSTOMER: true,
          PRIV_ADD_CUSTOMER_DURING_SALES: true,
          PRIV_MODIFY_CUSTOMER: true,
          PRIV_MANAGE_CUSTOMER_DEBT: true
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('PHONE_ALREADY_IN_USE');

      testDoneFn();
    })

  });

  it.skip('api/add-new-employee (Invalid organization)', testDoneFn => {

    callApi('api/add-new-employee', {
      json: {
        apiKey,

        email: thirdEmpEmail,
        fullName: thirdEmpFullName,
        phone: thirdEmpPhone,
        password: thirdEmpPassword,

        organizationId: invalidOrganizationId,
        role: "Joi.string().max(1024).required()",
        designation: "Joi.string().max(1024).required()",
        companyProvidedId: "abc123",

        privileges: {
          PRIV_VIEW_USERS: true,
          PRIV_MODIFY_USERS: true,
          PRIV_ADD_USER: true,
          PRIV_MAKE_USER_AN_OWNER: true,
          PRIV_MODIFY_USER_PRIVILEGES: true,

          PRIV_ACCESS_POS: true,
          PRIV_VIEW_SALES: true,
          PRIV_MODIFY_SALES: true,
          PRIV_ALLOW_FLAT_DISCOUNT: true,
          PRIV_ALLOW_INDIVIDUAL_DISCOUNT: true,
          PRIV_ALLOW_FOC: true,

          PRIV_VIEW_SALES_RETURN: true,
          PRIV_MODIFY_SALES_RETURN: true,

          PRIV_VIEW_ALL_INVENTORIES: true,
          PRIV_MODIFY_ALL_INVENTORIES: true,
          PRIV_TRANSFER_ALL_INVENTORIES: true,
          PRIV_REPORT_DAMAGES_IN_ALL_INVENTORIES: true,

          PRIV_VIEW_ALL_OUTLETS: true,
          PRIV_MODIFY_ALL_OUTLETS: true,

          PRIV_VIEW_ALL_WAREHOUSES: true,
          PRIV_MODIFY_ALL_WAREHOUSES: true,

          PRIV_VIEW_ORGANIZATION_STATISTICS: true,
          PRIV_MODIFY_ORGANIZATION: true,

          PRIV_VIEW_CUSTOMER: true,
          PRIV_ADD_CUSTOMER_DURING_SALES: true,
          PRIV_MODIFY_CUSTOMER: true,
          PRIV_MANAGE_CUSTOMER_DEBT: true
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('ORGANIZATION_INVALID');

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('employeeList');

      body.employeeList.forEach(employee => {
        validateEmploymentSchema(employee);
      });

      testDoneFn();
    })

  });

  it.skip('api/get-employee-list (Invalid)', testDoneFn => {

    callApi('api/get-employee-list', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('ORGANIZATION_INVALID');

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('employee');

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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('EMPLOYEE_INVALID');

      testDoneFn();
    })

  });

  it('api/edit-employment (Valid)', testDoneFn => {

    callApi('api/edit-employment', {
      json: {
        apiKey,

        employmentId: employeeToBeEditedData.id,

        isActive: false,

        role: employeeToBeEditedData.role,
        designation: employeeToBeEditedData.designation,
        companyProvidedId: employeeToBeEditedData.companyProvidedId,

        privileges: employeeToBeEditedData.privileges
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('employee');

      validateEmploymentSchema(body.employee);

      expect(body.employee).to.have.property('isActive').that.equals(false);

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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals('EMPLOYEE_INVALID');

      testDoneFn();
    })

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});