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
  addProductCategory,
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

const productCategoryName = "test product category";

let apiKey = null;
let organizationId = null;
let warehouseId = null;
let outletId = null;
let productCategoryId = null;

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
                addProductCategory({
                  apiKey,
                  organizationId,
                  parentProductCategoryId: null,
                  name: productCategoryName,
                  unit: "box",
                  defaultDiscountType: "percent",
                  defaultDiscountValue: 10,
                  defaultPurchasePrice: 99,
                  defaultVat: 3,
                  defaultSalePrice: 111,
                  isReturnable: true
                }, (data) => {
                  productCategoryId = data.productCategoryId;
                  testDoneFn();
                });
              });
            });
          });
        });
      });
    });
  });

  it('api/add-product-to-inventory (Valid)', testDoneFn => {

    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: 0,
        productList: [{ productCategoryId, purchasePrice: 100, salePrice: 200, count: 10 }]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      testDoneFn();
    });

  });

  // it('api/get-aggregated-inventory-details (Valid)', testDoneFn => {

  //   callApi('api/get-aggregated-inventory-details', {
  //     json: {
  //       apiKey,
  //       inventoryId: 0
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     // expect(body).to.have.property('warehouseList').that.is.an('array');

  //     // body.warehouseList.forEach(warehouse => {
  //     //   validateWarehouseSchema(warehouse);
  //     // });
  //     // warehouseList = body.warehouseList;

  //     testDoneFn();
  //   });

  // });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});