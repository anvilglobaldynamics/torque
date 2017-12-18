let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization,
  validateUserSchema
} = require('./lib');

const email = `t1${(new Date).getTime()}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = 't1' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const firstEmpEmail = `t2${(new Date).getTime()}@gmail.com`;
const firstEmpPassword = "123545678";
const firstEmpFullName = "Test Employee";
const firstEmpPhone = 't2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const secondEmpEmail = `t3${(new Date).getTime()}@gmail.com`;
const secondEmpPassword = "123545678";
const secondEmpFullName = "Test Employee";
const secondEmpPhone = 't3' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const thirdEmpEmail = `t4${(new Date).getTime()}@gmail.com`;
const thirdEmpPassword = "123545678";
const thirdEmpFullName = "Test Employee";
const thirdEmpPhone = 't4' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const orgEmail = `o1${(new Date).getTime()}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "My Address";
const orgPhone = 'o1' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

let apiKey = null;
let organizationId = null;
let employeeId = null;

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

  it('api/hire-user-as-employee (Invalid user)', testDoneFn => {

    callApi('api/hire-user-as-employee', {
      json: {
        apiKey,
        userId: -999,
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

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});