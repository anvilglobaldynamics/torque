let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization
} = require('./lib');

const email = `t2${(new Date).getTime()}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = 't2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const empEmail = `t3${(new Date).getTime()}@gmail.com`;
const empPassword = "123545678";
const empFullName = "Test Employee";
const empPhone = 't3' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const orgEmail = `o2${(new Date).getTime()}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "My Address";
const orgPhone = 'o2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

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
              email: empEmail,
              password: empPassword,
              fullName: empFullName,
              phone: empPhone
            }, (data) => {
              employeeId = data.userId;
              testDoneFn();
            });
          });
        });
      });
    });
  });

  it('api/hire-user-as-employee (Valid, all privileges): ' + email, testDoneFn => {

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

  it('api/hire-user-as-employee (Invalid user): ' + email, testDoneFn => {

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

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});