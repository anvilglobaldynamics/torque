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
  addWarehouse,
  getWarehouse,
  getOutlet,
  addOutlet,
  addProductCategory,
  validateInventorySchema,
  validateGetInventoryListApiSuccessResponse,
  validateGenericApiFailureResponse,
  validateGenericApiSuccessResponse,
  validateGetAggregatedInventoryDetailsApiSuccessResponse,
  validateReportInventoryDetailsApiSuccessResponse,
  validateAggregatedProductScema,
  validateProductCategorySchema,
  validateProductSchema,
} = require('./lib');

const prefix = 's';

const email = `${rnd(prefix)}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = rnd(prefix, 11);

const orgEmail = 'o1' + `${rnd(prefix)}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "Test Org Address";
const orgPhone = 'o1' + rnd(prefix, 11);

const warehousePhone = 'w' + rnd(prefix, 11);
const warehouseName = "Test Warehouse";
const warehousePhysicalAddress = "Test Warehouse Address";
const warehouseContactPersonName = "Test Warehouse Person";

const outletPhone = 'o2' + rnd(prefix, 11);
const outletName = "Test Outlet";
const outletPhysicalAddress = "Test Outlet Address";
const outletContactPersonName = "Test Outlet Person";

const productCategoryName = "test product category";

let apiKey = null;
let organizationId = null;
let warehouseId = null;
let outletId = null;
let productCategoryId = null;
let productCategoryId2 = null;

let warehouseDefaultInventoryId = null;
let warehouseReturnedInventoryId = null;
let warehouseDamagedInventoryId = null;

let outletDefaultInventoryId = null;
let outletReturnedInventoryId = null;
let outletDamagedInventoryId = null;

let productToBeTransferred = null;

let invalidOrganizationId = generateInvalidId();
let invalidInventoryId = generateInvalidId();
let invalidProductCategoryId = generateInvalidId();

describe.only('Inventory', _ => {

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
                warehouseDefaultInventoryId = data.defaultInventory.id;
                warehouseReturnedInventoryId = data.returnedInventory.id;
                warehouseDamagedInventoryId = data.damagedInventory.id;
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
                      name: "test product category",
                      unit: "box",
                      defaultDiscountType: "percent",
                      defaultDiscountValue: 10,
                      defaultPurchasePrice: 99,
                      defaultVat: 3,
                      defaultSalePrice: 111,
                      isReturnable: true
                    }, (data) => {
                      productCategoryId = data.productCategoryId;
                      addProductCategory({
                        apiKey,
                        organizationId,
                        name: "2nd test product category",
                        unit: "box",
                        defaultDiscountType: "percent",
                        defaultDiscountValue: 10,
                        defaultPurchasePrice: 199,
                        defaultVat: 3,
                        defaultSalePrice: 300,
                        isReturnable: false
                      }, (data) => {
                        productCategoryId2 = data.productCategoryId;
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

  it('api/get-inventory-list (Valid organizationId)', testDoneFn => {

    callApi('api/get-inventory-list', {
      json: {
        apiKey,
        organizationId: organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetInventoryListApiSuccessResponse(body);
      body.inventoryList.forEach(inventory => {
        validateInventorySchema(inventory);
      });
      testDoneFn();
    });

  });

  it('api/get-inventory-list (Invalid organizationId)', testDoneFn => {

    callApi('api/get-inventory-list', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('ORGANIZATION_INVALID');
      testDoneFn();
    });

  });

  it('api/add-product-to-inventory (Valid warehouse)', testDoneFn => {
    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId,
        productList: [
          { productCategoryId, purchasePrice: 100, salePrice: 200, count: 10 },
          { productCategoryId: productCategoryId2, purchasePrice: 199, salePrice: 300, count: 30 }
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });
  });

  it('api/add-product-to-inventory (Valid same product category)', testDoneFn => {
    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId,
        productList: [
          { productCategoryId, purchasePrice: 100, salePrice: 200, count: 5 },
          { productCategoryId: productCategoryId2, purchasePrice: 199, salePrice: 300, count: 5 }
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });
  });

  it('api/add-product-to-inventory (Invalid inventoryId)', testDoneFn => {

    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: invalidInventoryId,
        productList: [
          { productCategoryId, purchasePrice: 100, salePrice: 200, count: 10 }
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('INVENTORY_INVALID');
      testDoneFn();
    });

  });

  it('api/add-product-to-inventory (Invalid productCategoryId)', testDoneFn => {

    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId,
        productList: [
          {
            productCategoryId: invalidProductCategoryId,
            purchasePrice: 100,
            salePrice: 200,
            count: 10
          }
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('PRODUCT_CATEGORY_INVALID');
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid warehouse)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      body.aggregatedProductList.forEach(aggregatedProduct => {
        validateAggregatedProductScema(aggregatedProduct);
      });

      productToBeTransferred = body.aggregatedProductList[0];
      expect(body.aggregatedProductList[0].productId).to.not.equal(body.aggregatedProductList[1].productId);
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid searchString warehouse)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId,
        searchString: '2nd'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      body.aggregatedProductList.forEach(aggregatedProduct => {
        validateAggregatedProductScema(aggregatedProduct);
      });
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Invalid inventoryId)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: invalidInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('INVENTORY_INVALID');
      testDoneFn();
    });

  });

  it('api/transfer-between-inventories (Valid)', testDoneFn => {

    callApi('api/transfer-between-inventories', {
      json: {
        apiKey,
        fromInventoryId: warehouseDefaultInventoryId,
        toInventoryId: warehouseReturnedInventoryId,
        productList: [
          { productId: productToBeTransferred.productId, count: 1 }
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/transfer-between-inventories (Invalid product count)', testDoneFn => {

    callApi('api/transfer-between-inventories', {
      json: {
        apiKey,
        fromInventoryId: warehouseDefaultInventoryId,
        toInventoryId: warehouseReturnedInventoryId,
        productList: [
          { productId: productToBeTransferred.productId, count: 99999999 }
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('PRODUCT_INSUFFICIENT');
      testDoneFn();
    });

  });

  it('api/transfer-between-inventories (Invalid fromInventoryId)', testDoneFn => {

    callApi('api/transfer-between-inventories', {
      json: {
        apiKey,
        fromInventoryId: invalidInventoryId,
        toInventoryId: warehouseReturnedInventoryId,
        productList: [
          { productId: productToBeTransferred.productId, count: 1 }
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('FROM_INVENTORY_INVALID');
      testDoneFn();
    });

  });

  it('api/transfer-between-inventories (Invalid toInventoryId)', testDoneFn => {

    callApi('api/transfer-between-inventories', {
      json: {
        apiKey,
        fromInventoryId: warehouseDefaultInventoryId,
        toInventoryId: invalidInventoryId,
        productList: [
          { productId: productToBeTransferred.productId, count: 1 }
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('TO_INVENTORY_INVALID');
      testDoneFn();
    });

  });

  it('api/transfer-between-inventories (Valid duplicate)', testDoneFn => {

    callApi('api/transfer-between-inventories', {
      json: {
        apiKey,
        fromInventoryId: warehouseDefaultInventoryId,
        toInventoryId: warehouseReturnedInventoryId,
        productList: [
          { productId: productToBeTransferred.productId, count: 1 }
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid modification check)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: warehouseReturnedInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      expect(body.aggregatedProductList[0]).to.have.property('productId').that.equals(productToBeTransferred.productId);
      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(2);
      testDoneFn();
    });

  });

  it('api/transfer-between-inventories (Valid Warehouse to Outlet)', testDoneFn => {

    callApi('api/transfer-between-inventories', {
      json: {
        apiKey,
        fromInventoryId: warehouseDefaultInventoryId,
        toInventoryId: outletDefaultInventoryId,
        productList: [
          { productId: productToBeTransferred.productId, count: 3 }
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid modification check, Outlet)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: outletDefaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      expect(body.aggregatedProductList[0]).to.have.property('productId').that.equals(productToBeTransferred.productId);
      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(3);
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid modification check, Warehouse)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      expect(body.aggregatedProductList[0]).to.have.property('productId').that.equals(productToBeTransferred.productId);
      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(productToBeTransferred.count - 5);
      testDoneFn();
    });

  });

  it('api/report-inventory-details (Valid inventoryIdList check)', testDoneFn => {

    callApi('api/report-inventory-details', {
      json: {
        apiKey,
        inventoryIdList: [
          warehouseDefaultInventoryId, outletDefaultInventoryId
        ]
      }
    }, (err, response, body) => {
      console.log(body);
      expect(response.statusCode).to.equal(200);

      validateReportInventoryDetailsApiSuccessResponse(body);

      body.aggregatedInventoryDetailsList.forEach(aggregatedInventoryDetails =>  {
        aggregatedInventoryDetails.aggregatedProductList.forEach(aggregatedProduct => {
          validateAggregatedProductScema(aggregatedProduct);
        });
      });

      expect(body.aggregatedInventoryDetailsList[0].inventoryDetails.inventoryId).equals(warehouseDefaultInventoryId);
      expect(body.aggregatedInventoryDetailsList[1].inventoryDetails.inventoryId).equals(outletDefaultInventoryId);

      testDoneFn();
    });

  });

  it.skip('api/report-inventory-details (Valid inventoryIdList check more)', testDoneFn => {

    callApi('api/report-inventory-details', {
      json: {
        apiKey,
        inventoryIdList: [
          warehouseDefaultInventoryId, warehouseReturnedInventoryId, outletDefaultInventoryId
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateReportInventoryDetailsApiSuccessResponse(body);

      body.aggregatedInventoryDetailsList.forEach(aggregatedInventoryDetails =>  {
        aggregatedInventoryDetails.aggregatedProductList.forEach(aggregatedProduct => {
          validateAggregatedProductScema(aggregatedProduct);
        });
      });

      expect(body.aggregatedInventoryDetailsList[0].inventoryDetails.inventoryId).equals(warehouseDefaultInventoryId);
      expect(body.aggregatedInventoryDetailsList[1].inventoryDetails.inventoryId).equals(warehouseReturnedInventoryId);
      expect(body.aggregatedInventoryDetailsList[2].inventoryDetails.inventoryId).equals(outletDefaultInventoryId);

      testDoneFn();
    });

  });

  it.skip('api/report-inventory-details (Invalid invalidInventoryId in inventoryIdList)', testDoneFn => {

    callApi('api/report-inventory-details', {
      json: {
        apiKey,
        inventoryIdList: [
          warehouseDefaultInventoryId, invalidInventoryId, outletDefaultInventoryId
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('INVENTORY_INVALID');
      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});