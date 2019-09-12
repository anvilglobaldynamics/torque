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
  addProductBlueprint,
  validateInventorySchema,
  validateGetInventoryListApiSuccessResponse,
  validateGenericApiFailureResponse,
  validateGenericApiSuccessResponse,
  validateGetAggregatedInventoryDetailsApiSuccessResponse,
  validateGetProductTransferListApiSuccessResponse,
  validateGetProductAcquisitionListApiSuccessResponse,
  validateReportInventoryDetailsApiSuccessResponse,
  validateAggregatedProductScema,
  validateAddVendorApiSuccessResponse,
  validateProductBlueprintSchema,
  validateProductSchema,
  validateGetProductApiSuccessResponse,
  validateAddProductToInventoryApiSuccessResponse,
  validateAddProductCategoryApiSuccessResponse
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

const vendorPhone = 'v1' + rnd(prefix, 11);

const warehousePhone = 'w' + rnd(prefix, 11);
const warehouseName = "Test Warehouse";
const warehousePhysicalAddress = "Test Warehouse Address";
const warehouseContactPersonName = "Test Warehouse Person";

const outletPhone = 'o2' + rnd(prefix, 11);
const outletName = "Test Outlet";
const outletPhysicalAddress = "Test Outlet Address";
const outletContactPersonName = "Test Outlet Person";

const productBlueprintName = "test product blueprint";

let apiKey = null;
let organizationId = null;
let warehouseId = null;
let outletId = null;
let productBlueprintId = null;
let productBlueprintId2 = null;
let productBlueprintId3 = null;
let productBlueprintId4 = null;

let productTransferNumber = null;
let InvalidProductTransferNumber = 9999999999;

let vendorId = null;
let productAcquisitionNumber = null;

let warehouseDefaultInventoryId = null;
let warehouseReturnedInventoryId = null;
let warehouseDamagedInventoryId = null;

let outletDefaultInventoryId = null;
let outletReturnedInventoryId = null;
let outletDamagedInventoryId = null;

let productToBeTransferred = null;
let productToBeEditedId = null;

let invalidOrganizationId = generateInvalidId();
let invalidInventoryId = generateInvalidId();
let invalidProductBlueprintId = generateInvalidId();

let productCategoryId = null;

describe('Inventory', _ => {

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
            email: orgEmail,
            activeModuleCodeList: ['MOD_PRODUCT', 'MOD_SERVICE', 'MOD_VENDOR']
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
                  contactPersonName: outletContactPersonName,
                  location: { lat: 23.7945153, lng: 90.4139857 },
                  categoryCode: 'CAT_GENERAL'
                }, (data) => {
                  outletId = data.outletId;
                  getOutlet({
                    apiKey, outletId
                  }, (data) => {
                    outletDefaultInventoryId = data.defaultInventory.id;
                    outletReturnedInventoryId = data.returnedInventory.id;
                    outletDamagedInventoryId = data.damagedInventory.id;
                    addProductBlueprint({
                      apiKey,
                      organizationId,
                      name: "test product blueprint",
                      unit: "box",
                      identifierCode: '',
                      defaultPurchasePrice: 99,
                      defaultVat: 3,
                      defaultSalePrice: 111,
                      productCategoryIdList: [],
                      isReturnable: true
                    }, (data) => {
                      productBlueprintId = data.productBlueprintId;
                      addProductBlueprint({
                        apiKey,
                        organizationId,
                        name: "2nd test product blueprint",
                        unit: "box",
                        identifierCode: '',
                        defaultPurchasePrice: 199,
                        defaultVat: 3,
                        defaultSalePrice: 300,
                        productCategoryIdList: [],
                        isReturnable: false
                      }, (data) => {
                        productBlueprintId2 = data.productBlueprintId;
                        addProductBlueprint({
                          apiKey,
                          organizationId,
                          name: "test product blueprint 2",
                          unit: "box",
                          identifierCode: 'AAAA',
                          defaultPurchasePrice: 99,
                          defaultVat: 3,
                          defaultSalePrice: 111,
                          productCategoryIdList: [],
                          isReturnable: true
                        }, (data) => {
                          productBlueprintId3 = data.productBlueprintId;
                          addProductBlueprint({
                            apiKey,
                            organizationId,
                            name: "2nd test product blueprint 2",
                            unit: "box",
                            identifierCode: 'BBBB',
                            defaultPurchasePrice: 199,
                            defaultVat: 3,
                            defaultSalePrice: 300,
                            productCategoryIdList: [],
                            isReturnable: false
                          }, (data) => {
                            productBlueprintId4 = data.productBlueprintId;
                            addProductBlueprint({
                              apiKey,
                              organizationId,
                              name: "Product BLueprint With Vendor",
                              unit: "box",
                              identifierCode: 'VVVV',
                              defaultPurchasePrice: 199,
                              defaultVat: 3,
                              defaultSalePrice: 300,
                              productCategoryIdList: [],
                              isReturnable: false
                            }, (data) => {
                              productBlueprintId5ForVendor = data.productBlueprintId;
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
          { productBlueprintId, count: 10 },
          { productBlueprintId: productBlueprintId2, count: 30 }
        ],
        vendorId: null
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddProductToInventoryApiSuccessResponse(body);
      testDoneFn();
    });
  });

  it('api/add-product-to-inventory (Valid same product blueprint)', testDoneFn => {
    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId,
        productList: [
          { productBlueprintId, count: 5 },
          { productBlueprintId: productBlueprintId2, count: 5 }
        ],
        vendorId: null
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddProductToInventoryApiSuccessResponse(body);
      testDoneFn();
    });
  });

  it('api/add-product-to-inventory (Invalid inventoryId)', testDoneFn => {

    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: invalidInventoryId,
        productList: [
          { productBlueprintId, count: 10 }
        ],
        vendorId: null
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('INVENTORY_INVALID');
      testDoneFn();
    });

  });

  it('api/add-product-to-inventory (Invalid productBlueprintId)', testDoneFn => {

    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId,
        productList: [
          {
            productBlueprintId: invalidProductBlueprintId,
            count: 10
          }
        ],
        vendorId: null
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('PRODUCT_BLUEPRINT_INVALID');
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid warehouse; Ensure existing product is being reused.)', testDoneFn => {

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
      expect(body.aggregatedProductList.length).to.equal(2);
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
      expect(body.aggregatedProductList[0].count).to.equal(15);
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

  // acquisition record - start

  it('api/add-vendor (Valid)', testDoneFn => {

    callApi('api/add-vendor', {
      json: {
        apiKey,
        organizationId,
        name: "1st vendor",
        contactPersonName: "a person",
        phone: vendorPhone,
        physicalAddress: "an address"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddVendorApiSuccessResponse(body);
      vendorId = body.vendorId;
      testDoneFn();
    })

  });

  it('api/add-product-to-inventory (Valid warehouse; Damaged; With Vendor)', testDoneFn => {
    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: warehouseDamagedInventoryId,
        productList: [
          { productBlueprintId: productBlueprintId5ForVendor, count: 60 },
        ],
        vendorId: vendorId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddProductToInventoryApiSuccessResponse(body);
      testDoneFn();
    });
  });

  it('api/get-product-acquisition-list (Valid)', testDoneFn => {

    callApi('api/get-product-acquisition-list', {
      json: {
        apiKey,
        fromDate: Date.now() - 24 * 60 * 60 * 1000,
        toDate: Date.now(),
        vendorId: null,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetProductAcquisitionListApiSuccessResponse(body);
      expect(body.productAcquisitionList.length).to.equal(3);
      expect(body.productAcquisitionList[0].vendor.id).to.equal(vendorId);
      expect(body.productAcquisitionList[0].productAcquisitionNumber).to.equal(3);
      productAcquisitionNumber = body.productAcquisitionList[0].productAcquisitionNumber;
      testDoneFn();
    });

  });

  it('api/get-product-acquisition-list (Valid; by vendorId)', testDoneFn => {

    callApi('api/get-product-acquisition-list', {
      json: {
        apiKey,
        fromDate: Date.now() - 24 * 60 * 60 * 1000,
        toDate: Date.now(),
        vendorId,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetProductAcquisitionListApiSuccessResponse(body);
      expect(body.productAcquisitionList.length).to.equal(1);
      expect(body.productAcquisitionList[0].vendor.id).to.equal(vendorId);
      expect(body.productAcquisitionList[0].productAcquisitionNumber).to.equal(3);
      testDoneFn();
    });

  });

  it('api/get-product-acquisition-list (Invalid; by vendorId)', testDoneFn => {

    callApi('api/get-product-acquisition-list', {
      json: {
        apiKey,
        fromDate: Date.now() - 24 * 60 * 60 * 1000,
        toDate: Date.now(),
        vendorId: 9999999999,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetProductAcquisitionListApiSuccessResponse(body);
      expect(body.productAcquisitionList.length).to.equal(0);
      testDoneFn();
    });

  });

  it('api/get-product-acquisition-list (Valid; by productAcquisitionNumber)', testDoneFn => {

    callApi('api/get-product-acquisition-list', {
      json: {
        apiKey,
        fromDate: Date.now() - 24 * 60 * 60 * 1000,
        toDate: Date.now(),
        vendorId: null,
        searchString: String(productAcquisitionNumber),
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetProductAcquisitionListApiSuccessResponse(body);
      expect(body.productAcquisitionList.length).to.equal(1);
      expect(body.productAcquisitionList[0].vendor.id).to.equal(vendorId);
      expect(body.productAcquisitionList[0].productAcquisitionNumber).to.equal(3);
      testDoneFn();
    });

  });

  // acquisition record - end

  it('api/transfer-between-inventories (Valid)', testDoneFn => {

    callApi('api/transfer-between-inventories', {
      json: {
        apiKey,
        fromInventoryId: warehouseDefaultInventoryId,
        toInventoryId: warehouseReturnedInventoryId,
        productList: [
          { productId: productToBeTransferred.productId, count: 1 }
        ],
        vendorId: null
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
        ],
        vendorId: null
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
        ],
        vendorId: null
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
        ],
        vendorId: null
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
        ],
        vendorId: null
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/get-product-transfer-list (Valid)', testDoneFn => {

    callApi('api/get-product-transfer-list', {
      json: {
        apiKey,
        fromDate: Date.now() - 24 * 60 * 60 * 1000,
        toDate: Date.now(),
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetProductTransferListApiSuccessResponse(body);
      expect(body.productTransferList.length).to.equal(2);
      expect(body.productTransferList[0].productList[0]).to.have.property('productId').that.equals(productToBeTransferred.productId);
      productTransferNumber = body.productTransferList[0].productTransferNumber;
      testDoneFn();
    });

  });

  it('api/get-product-transfer-list (Valid, should return only one result)', testDoneFn => {

    callApi('api/get-product-transfer-list', {
      json: {
        apiKey,
        fromDate: Date.now() - 24 * 60 * 60 * 1000,
        toDate: Date.now(),
        organizationId,
        searchString: String(productTransferNumber)
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetProductTransferListApiSuccessResponse(body);
      expect(body.productTransferList.length).to.equal(1);
      expect(body.productTransferList[0].productList[0]).to.have.property('productId').that.equals(productToBeTransferred.productId);
      testDoneFn();
    });

  });

  it('api/get-product-transfer-list (Correct but Invalid, should return no results)', testDoneFn => {

    callApi('api/get-product-transfer-list', {
      json: {
        apiKey,
        fromDate: Date.now() - 24 * 60 * 60 * 1000,
        toDate: Date.now(),
        organizationId,
        searchString: String(InvalidProductTransferNumber)
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetProductTransferListApiSuccessResponse(body);
      expect(body.productTransferList.length).to.equal(0);
      testDoneFn();
    });

  });


  it('api/get-product-transfer-list (Invalid organizationId)', testDoneFn => {

    callApi('api/get-product-transfer-list', {
      json: {
        apiKey,
        fromDate: Date.now() - 24 * 60 * 60 * 1000,
        toDate: Date.now(),
        organizationId: invalidOrganizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('ORGANIZATION_INVALID');
      testDoneFn();
    });

  });

  it('api/get-product-transfer-list (Invalid searchString)', testDoneFn => {

    callApi('api/get-product-transfer-list', {
      json: {
        apiKey,
        fromDate: Date.now() - 24 * 60 * 60 * 1000,
        toDate: Date.now(),
        organizationId: organizationId,
        searchString: 34343434
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('VALIDATION_ERROR');
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
        ],
        vendorId: null
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
      productToBeEditedId = body.aggregatedProductList[0].productId;
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
        ],
        productBlueprintIdList: [],
        productCategoryIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateReportInventoryDetailsApiSuccessResponse(body);

      body.aggregatedInventoryDetailsList.forEach(aggregatedInventoryDetails => {
        aggregatedInventoryDetails.aggregatedProductList.forEach(aggregatedProduct => {
          validateAggregatedProductScema(aggregatedProduct);
        });
      });

      expect(body.aggregatedInventoryDetailsList[0].inventoryDetails.inventoryId).equals(warehouseDefaultInventoryId);
      expect(body.aggregatedInventoryDetailsList[1].inventoryDetails.inventoryId).equals(outletDefaultInventoryId);

      testDoneFn();
    });

  });

  it('api/report-inventory-details (Valid inventoryIdList check more)', testDoneFn => {

    callApi('api/report-inventory-details', {
      json: {
        apiKey,
        inventoryIdList: [
          warehouseDefaultInventoryId, warehouseReturnedInventoryId, outletDefaultInventoryId
        ],
        productBlueprintIdList: [],
        productCategoryIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateReportInventoryDetailsApiSuccessResponse(body);

      body.aggregatedInventoryDetailsList.forEach(aggregatedInventoryDetails => {
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

  it('api/report-inventory-details (Valid productBlueprintIdList check)', testDoneFn => {

    callApi('api/report-inventory-details', {
      json: {
        apiKey,
        inventoryIdList: [
          warehouseDefaultInventoryId, outletDefaultInventoryId
        ],
        productBlueprintIdList: [
          productBlueprintId
        ],
        productCategoryIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateReportInventoryDetailsApiSuccessResponse(body);

      body.aggregatedInventoryDetailsList.forEach(aggregatedInventoryDetails => {
        aggregatedInventoryDetails.aggregatedProductList.forEach(aggregatedProduct => {
          validateAggregatedProductScema(aggregatedProduct);
        });
      });

      expect(body.aggregatedInventoryDetailsList[0].aggregatedProductList[0].product.productBlueprint.id).to.equal(productBlueprintId);

      expect(body.aggregatedInventoryDetailsList[0].inventoryDetails.inventoryId).equals(warehouseDefaultInventoryId);
      expect(body.aggregatedInventoryDetailsList[1].inventoryDetails.inventoryId).equals(outletDefaultInventoryId);

      testDoneFn();
    });

  });

  it('api/add-product-category (Valid; To Create productCategory)', testDoneFn => {

    callApi('api/add-product-category', {
      json: {
        apiKey,
        organizationId,
        name: "1st product category",
        colorCode: "FFFFFF"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddProductCategoryApiSuccessResponse(body);
      productCategoryId = body.productCategoryId;
      testDoneFn();
    })

  });

  it('api/edit-product-blueprint (Valid; To Set productCategoryId)', testDoneFn => {

    callApi('api/edit-product-blueprint', {
      json: {
        apiKey,
        productBlueprintId: productBlueprintId,
        name: "test product blueprint",
        unit: "box",
        identifierCode: '',
        defaultPurchasePrice: 99,
        defaultVat: 3,
        defaultSalePrice: 111,
        productCategoryIdList: [productCategoryId],
        isReturnable: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/report-inventory-details (Valid productCategoryIdList check)', testDoneFn => {

    callApi('api/report-inventory-details', {
      json: {
        apiKey,
        inventoryIdList: [
          warehouseDefaultInventoryId, outletDefaultInventoryId
        ],
        productBlueprintIdList: [],
        productCategoryIdList: [
          productCategoryId
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateReportInventoryDetailsApiSuccessResponse(body);

      body.aggregatedInventoryDetailsList.forEach(aggregatedInventoryDetails => {
        aggregatedInventoryDetails.aggregatedProductList.forEach(aggregatedProduct => {
          validateAggregatedProductScema(aggregatedProduct);
        });
      });

      expect(body.aggregatedInventoryDetailsList[0].aggregatedProductList[0].product.productBlueprint.productCategoryIdList).to.contain(productCategoryId)

      testDoneFn();
    });

  });

  it('api/report-inventory-details (Invalid; Both productBlueprintIdList and productCategoryId)', testDoneFn => {

    callApi('api/report-inventory-details', {
      json: {
        apiKey,
        inventoryIdList: [
          warehouseDefaultInventoryId, outletDefaultInventoryId
        ],
        productBlueprintIdList: [
          productBlueprintId
        ],
        productCategoryIdList: [
          productCategoryId
        ]
      }
    }, (err, response, body) => {

      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('PREDETERMINER_SETUP_INVALID');

      testDoneFn();
    });

  });

  it('api/report-inventory-details (Invalid invalidInventoryId in inventoryIdList)', testDoneFn => {

    callApi('api/report-inventory-details', {
      json: {
        apiKey,
        inventoryIdList: [
          warehouseDefaultInventoryId, invalidInventoryId, outletDefaultInventoryId
        ],
        productBlueprintIdList: [],
        productCategoryIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('INVENTORY_INVALID');
      testDoneFn();
    });

  });

  it('api/report-inventory-details (empty inventoryIdList)', testDoneFn => {

    callApi('api/report-inventory-details', {
      json: {
        apiKey,
        inventoryIdList: [],
        productBlueprintIdList: [],
        productCategoryIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equals('VALIDATION_ERROR');
      testDoneFn();
    });

  });

  // Region: includeZeroCountProducts test - start

  let includeZeroCountProductsProductId = null;

  it('api/add-product-to-inventory (Valid warehouse)', testDoneFn => {
    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId,
        productList: [
          { productBlueprintId, count: 10 },
        ],
        vendorId: null
      }
    }, (err, response, body) => {
      includeZeroCountProductsProductId = body.insertedProductList[0].productId;
      expect(response.statusCode).to.equal(200);
      validateAddProductToInventoryApiSuccessResponse(body);
      testDoneFn();
    });
  });

  it('api/get-aggregated-inventory-details (Valid, Checking Current Status, Warehouse) - 1', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      body.aggregatedProductList.reverse();
      expect(body.aggregatedProductList[1]).to.have.property('productId').that.equals(includeZeroCountProductsProductId);
      expect(body.aggregatedProductList[1]).to.have.property('count').that.equals(20);
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
          { productId: includeZeroCountProductsProductId, count: 20 }
        ],
        vendorId: null
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid modification check, Warehouse) - 1', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      body.aggregatedProductList.reverse();
      expect(body.aggregatedProductList[1]).to.have.property('productId').that.equals(includeZeroCountProductsProductId);
      expect(body.aggregatedProductList[1]).to.have.property('count').that.equals(0);
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid modification check, Warehouse)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId,
        includeZeroCountProducts: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      body.aggregatedProductList.reverse();
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      expect(body.aggregatedProductList[0]).to.have.property('productId').that.not.equals(includeZeroCountProductsProductId);
      expect(body.aggregatedProductList[0]).to.have.property('count').that.not.equals(10);
      testDoneFn();
    });

  });

  // Region: includeZeroCountProducts test - end

  // Region: identifierCode test - start

  let identifierCodeProductId = null;
  let identifierCodeProductId2 = null;

  it('api/add-product-to-inventory (Valid warehouse)', testDoneFn => {
    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId,
        productList: [
          { productBlueprintId: productBlueprintId3, count: 10 },
        ],
        vendorId: null
      }
    }, (err, response, body) => {
      identifierCodeProductId = body.insertedProductList[0].productId;
      expect(response.statusCode).to.equal(200);
      validateAddProductToInventoryApiSuccessResponse(body);
      testDoneFn();
    });
  });

  it('api/get-aggregated-inventory-details (Valid, Checking Current Status, Warehouse) - 2', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      body.aggregatedProductList.reverse();
      expect(body.aggregatedProductList[0]).to.have.property('productId').that.equals(identifierCodeProductId);
      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(10);
      testDoneFn();
    });

  });

  it('api/add-product-to-inventory (Valid warehouse)', testDoneFn => {
    callApi('api/add-product-to-inventory', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId,
        productList: [
          { productBlueprintId: productBlueprintId4, count: 8 },
        ],
        vendorId: null
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddProductToInventoryApiSuccessResponse(body);
      identifierCodeProductId2 = body.insertedProductList[0].productId;
      testDoneFn();
    });
  });

  it('api/get-aggregated-inventory-details (Valid, Checking Current Status, Warehouse) - 3', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      body.aggregatedProductList.reverse();
      expect(body.aggregatedProductList[0]).to.have.property('productId').that.equals(identifierCodeProductId2);
      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(8);
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid, by identifierCode)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId,
        identifierCode: 'AAAA'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      expect(body.aggregatedProductList.length).to.equal(1);
      expect(body.aggregatedProductList[0]).to.have.property('productId').that.equals(identifierCodeProductId);
      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(10);
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid, by identifierCode, expected no results)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId,
        identifierCode: 'XXXX'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      expect(body.aggregatedProductList.length).to.equal(0);
      testDoneFn();
    });

  });

  // Region: identifierCode test - end

  // Region: sortOrder - start

  it('api/get-aggregated-inventory-details (Valid, sortOrder)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId,
        sortOrder: 'blueprint-created-date-descending'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      let originalList = body.aggregatedProductList;
      for (let i = 0; i < originalList.length - 1; i++) {
        expect(originalList[i].product.productBlueprint.createdDatetimeStamp)
          .to.be.not.lessThan(originalList[i + 1].product.productBlueprint.createdDatetimeStamp);
      }
      testDoneFn();
    });

  });

  // Region: sortOrder - end

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});