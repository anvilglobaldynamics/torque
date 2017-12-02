let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization,
  addWarehouse,
  addOutlet,
  validateInventorySchema
} = require('./lib');

const email = `t2${(new Date).getTime()}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = 't2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const orgEmail = `o2${(new Date).getTime()}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "Test Org Address";
const orgPhone = 'o2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const warehousePhone = 'o2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');
const warehouseName = "Test Warehouse";
const warehousePhysicalAddress = "Test Warehouse Address";
const warehouseContactPersonName = "Test Warehouse Person";

const outletPhone = 'o2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');
const outletName = "Test Outlet";
const outletPhysicalAddress = "Test Outlet Address";
const outletContactPersonName = "Test Outlet Person";

let apiKey = null;
let organizationId = null;
let warehouseId = null;
let outletId = null;

describe('inventory', _ => {

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
            addWarehouse({
              apiKey,
              organizationId,
              name: warehouseName,
              physicalAddress: warehousePhysicalAddress,
              phone: warehousePhone,
              contactPersonName: warehouseContactPersonName
            }, (data) => {
              warehouseId = data.warehouseId;
              addOutlet({
                apiKey,
                organizationId,
                name: outletName,
                physicalAddress: outletPhysicalAddress,
                phone: outletPhone,
                contactPersonName: outletContactPersonName
              }, (data) => {
                outletId = data.outletId;
                testDoneFn();
              });
            });
          });
        });
      });
    });
  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});