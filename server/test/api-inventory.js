let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization,
  addWarehouse,
  getWarehouse,
  addOutlet,
  addProductCategory,
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
let defaultInventoryId = null;
let outletId = null;
let productCategoryId = null;
let returnedInventoryId = null;
let damagedInventoryId = null;
let productToBeTransferredId = null;

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
              getWarehouse({
                apiKey, warehouseId
              }, (data) => {
                defaultInventoryId = data.defaultInventory.id;
                returnedInventoryId = data.returnedInventory.id;
                damagedInventoryId = data.damagedInventory.id;
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
  });

  it('api/add-product-to-inventory (Valid)', testDoneFn => {

    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: defaultInventoryId,
        productList: [{ productCategoryId, purchasePrice: 100, salePrice: 200, count: 10 }]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: defaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('productList').that.is.an('array');
      expect(body).to.have.property('matchingProductList').that.is.an('array');
      expect(body).to.have.property('matchingProductCategoryList').that.is.an('array');

      productToBeTransferredId = body.productList[0].productId;

      body.matchingProductList.forEach(product => {
        validateProductSchema(product);
      });
      body.matchingProductCategoryList.forEach(productCategory => {
        validateProductCategorySchema(productCategory);
      });

      testDoneFn();
    });

  });

  it('api/transfer-between-inventories (Valid)', testDoneFn => {

    callApi('api/transfer-between-inventories', {
      json: {
        apiKey,
        fromInventoryId: defaultInventoryId,
        toInventoryId: returnedInventoryId,
        productList: [{ productId: productToBeTransferredId, count: 1 }]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      testDoneFn();
    });

  });

  it('api/transfer-between-inventories (Valid duplicate)', testDoneFn => {

    callApi('api/transfer-between-inventories', {
      json: {
        apiKey,
        fromInventoryId: defaultInventoryId,
        toInventoryId: returnedInventoryId,
        productList: [{ productId: productToBeTransferredId, count: 1 }]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid modification check)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: defaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('productList').that.is.an('array');
      expect(body).to.have.property('matchingProductList').that.is.an('array');
      expect(body).to.have.property('matchingProductCategoryList').that.is.an('array');

      body.matchingProductList.forEach(product => {
        validateProductSchema(product);
      });
      body.matchingProductCategoryList.forEach(productCategory => {
        validateProductCategorySchema(productCategory);
      });

      expect(body.productList[0]).to.have.property('productId').that.equals(productToBeTransferredId);
      expect(body.productList[0]).to.have.property('count').that.equals(8);

      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid modification check)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: returnedInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('productList').that.is.an('array');
      expect(body).to.have.property('matchingProductList').that.is.an('array');
      expect(body).to.have.property('matchingProductCategoryList').that.is.an('array');

      body.matchingProductList.forEach(product => {
        validateProductSchema(product);
      });
      body.matchingProductCategoryList.forEach(productCategory => {
        validateProductCategorySchema(productCategory);
      });

      expect(body.productList[0]).to.have.property('productId').that.equals(productToBeTransferredId);
      expect(body.productList[0]).to.have.property('count').that.equals(2);

      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});