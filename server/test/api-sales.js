let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization,
  addOutlet,
  addProductCategory,
  addProductToInventory,
  addCustomer,
  getOutlet,
  validateInventorySchema,
  validateProductCategorySchema,
  validateProductSchema
} = require('./lib');

const email = `t2${(new Date).getTime()}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = 't2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const orgEmail = `o2${(new Date).getTime()}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "Test Org Address";
const orgPhone = 'o2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const outletPhone = 'o2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');
const outletName = "Test Outlet";
const outletPhysicalAddress = "Test Outlet Address";
const outletContactPersonName = "Test Outlet Person";

const productCategoryName = "test product category";

const customerFullName = "A Test Customer";
const customerPhone = 'o' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');
const openingBalance = '500';

let apiKey = null;
let organizationId = null;
let outletId = null;
let productCategoryId = null;
let customerId = null;

let outletDefaultInventoryId = null;
let outletReturnedInventoryId = null;
let outletDamagedInventoryId = null;

let productToBeTransferredId = null;

describe('sales', _ => {

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
            addOutlet({
              apiKey,
              organizationId,
              name: outletName,
              physicalAddress: outletPhysicalAddress,
              phone: outletPhone,
              contactPersonName: outletContactPersonName
            }, (data) => {
              outletId = data.outletId;
              getOutlet({
                apiKey, outletId
              }, (data) => {
                outletDefaultInventoryId = data.defaultInventory.id;
                outletReturnedInventoryId = data.returnedInventory.id;
                outletDamagedInventoryId = data.damagedInventory.id;
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
                  addProductToInventory({
                    apiKey,
                    inventoryId: outletDefaultInventoryId,
                    productList: [
                      { productCategoryId, purchasePrice: 99, salePrice: 200, count: 100 }
                    ]
                  }, (data) => {
                    addCustomer({
                      apiKey,
                      organizationId,
                      fullName: customerFullName,
                      phone: customerPhone,
                      openingBalance
                    }, (data) => {
                      customerId = data.customerId;
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

  // it('api/save-sales (Valid)', testDoneFn => {

  //   callApi('api/save-sales', {
  //     json: {
  //       apiKey,
  //       inventoryId: warehouseDefaultInventoryId,
  //       productList: [
  //         { productCategoryId, purchasePrice: 100, salePrice: 200, count: 10 }
  //       ]
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     testDoneFn();
  //   });

  // });

  // it('api/get-aggregated-inventory-details (Valid warehouse)', testDoneFn => {

  //   callApi('api/get-aggregated-inventory-details', {
  //     json: {
  //       apiKey,
  //       inventoryId: warehouseDefaultInventoryId
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     expect(body).to.have.property('productList').that.is.an('array');
  //     expect(body).to.have.property('matchingProductList').that.is.an('array');
  //     expect(body).to.have.property('matchingProductCategoryList').that.is.an('array');

  //     productToBeTransferredId = body.productList[0].productId;

  //     body.matchingProductList.forEach(product => {
  //       validateProductSchema(product);
  //     });
  //     body.matchingProductCategoryList.forEach(productCategory => {
  //       validateProductCategorySchema(productCategory);
  //     });

  //     testDoneFn();
  //   });

  // });

  // it('api/transfer-between-inventories (Valid)', testDoneFn => {

  //   callApi('api/transfer-between-inventories', {
  //     json: {
  //       apiKey,
  //       fromInventoryId: warehouseDefaultInventoryId,
  //       toInventoryId: warehouseReturnedInventoryId,
  //       productList: [
  //         { productId: productToBeTransferredId, count: 1 }
  //       ]
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     testDoneFn();
  //   });

  // });

  // it('api/transfer-between-inventories (Valid duplicate)', testDoneFn => {

  //   callApi('api/transfer-between-inventories', {
  //     json: {
  //       apiKey,
  //       fromInventoryId: warehouseDefaultInventoryId,
  //       toInventoryId: warehouseReturnedInventoryId,
  //       productList: [
  //         { productId: productToBeTransferredId, count: 1 }
  //       ]
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     testDoneFn();
  //   });

  // });

  // it('api/get-aggregated-inventory-details (Valid modification check)', testDoneFn => {

  //   callApi('api/get-aggregated-inventory-details', {
  //     json: {
  //       apiKey,
  //       inventoryId: warehouseReturnedInventoryId
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     expect(body).to.have.property('productList').that.is.an('array');
  //     expect(body).to.have.property('matchingProductList').that.is.an('array');
  //     expect(body).to.have.property('matchingProductCategoryList').that.is.an('array');

  //     body.matchingProductList.forEach(product => {
  //       validateProductSchema(product);
  //     });
  //     body.matchingProductCategoryList.forEach(productCategory => {
  //       validateProductCategorySchema(productCategory);
  //     });

  //     expect(body.productList[0]).to.have.property('productId').that.equals(productToBeTransferredId);
  //     expect(body.productList[0]).to.have.property('count').that.equals(2);

  //     testDoneFn();
  //   });

  // });


  // it('api/transfer-between-inventories (Valid Warehouse to Outlet)', testDoneFn => {

  //   callApi('api/transfer-between-inventories', {
  //     json: {
  //       apiKey,
  //       fromInventoryId: warehouseDefaultInventoryId,
  //       toInventoryId: outletDefaultInventoryId,
  //       productList: [
  //         { productId: productToBeTransferredId, count: 3 }
  //       ]
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     testDoneFn();
  //   });

  // });

  // it('api/get-aggregated-inventory-details (Valid modification check, Outlet)', testDoneFn => {

  //   callApi('api/get-aggregated-inventory-details', {
  //     json: {
  //       apiKey,
  //       inventoryId: outletDefaultInventoryId
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     expect(body).to.have.property('productList').that.is.an('array');
  //     expect(body).to.have.property('matchingProductList').that.is.an('array');
  //     expect(body).to.have.property('matchingProductCategoryList').that.is.an('array');

  //     body.matchingProductList.forEach(product => {
  //       validateProductSchema(product);
  //     });
  //     body.matchingProductCategoryList.forEach(productCategory => {
  //       validateProductCategorySchema(productCategory);
  //     });

  //     expect(body.productList[0]).to.have.property('productId').that.equals(productToBeTransferredId);
  //     expect(body.productList[0]).to.have.property('count').that.equals(3);

  //     testDoneFn();
  //   });

  // });

  // it('api/get-aggregated-inventory-details (Valid modification check, Warehouse)', testDoneFn => {

  //   callApi('api/get-aggregated-inventory-details', {
  //     json: {
  //       apiKey,
  //       inventoryId: warehouseDefaultInventoryId
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     expect(body).to.have.property('productList').that.is.an('array');
  //     expect(body).to.have.property('matchingProductList').that.is.an('array');
  //     expect(body).to.have.property('matchingProductCategoryList').that.is.an('array');

  //     body.matchingProductList.forEach(product => {
  //       validateProductSchema(product);
  //     });
  //     body.matchingProductCategoryList.forEach(productCategory => {
  //       validateProductCategorySchema(productCategory);
  //     });

  //     expect(body.productList[0]).to.have.property('productId').that.equals(productToBeTransferredId);
  //     expect(body.productList[0]).to.have.property('count').that.equals(5);

  //     testDoneFn();
  //   });

  // });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});