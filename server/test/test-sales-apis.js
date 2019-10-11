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
  addOutlet,
  addWarehouse,
  addProductBlueprint,
  addProductToInventory,
  addCustomer,
  getCustomer,
  getOutlet,
  getWarehouse,
  addServiceBlueprint,
  validateInventorySchema,
  validateProductBlueprintSchema,
  validateProductSchema,
  validateGenericApiFailureResponse,
  validateGenericApiSuccessResponse,
  validateGetAggregatedInventoryDetailsApiSuccessResponse,
  validateAddSalesApiSuccessResponse,
  validateGetSalesApiSuccessResponse,
  validateGraphSalesApiSuccessResponse,
  validateGetSalesListApiSuccessResponse,
  validateAddSalesReturnApiSuccessResponse,
  validateSalesSchema,
  validateSalesSchemaWhenListObj,

  validateGetActiveServiceListApiSuccessResponse,
  validateServiceSchema,

  validateGetServiceMembershipListApiSuccessResponse,
  validateServiceMembershipSchemaWhenListObj,

  validateGetCustomerApiSuccessResponse,
  validateCustomerSchema,

  getActiveServiceList,
  addSales,

  getAsyncDatabase,

  validateGetDiscountPresetListApiSuccessResponse,
  validateDiscountPresetSchema,
  validateAddDiscountPresetApiSuccessResponse,

  validateReportCollectionDetailsApiSuccessResponse,
  validateCollectionSchema,

  addProductCategory,
  validateReportProductSalesDetailsApiSuccessResponse
} = require('./lib');

const prefix = 's';

const email = `${rnd(prefix)}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = rnd(prefix, 11);

const orgEmail = 'o' + `${rnd(prefix)}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "Test Org Address";
const orgPhone = 'o' + rnd(prefix, 11);

const outletPhone = 'o1' + rnd(prefix, 11);
const outletName = "Test Outlet";
const outletPhysicalAddress = "Test Outlet Address";
const outletContactPersonName = "Test Outlet Person";

const productBlueprintName = "test product blueprint";

const customerFullName = "A Test Customer";
const customerPhone = 'c' + rnd(prefix, 11);
const openingBalance = '500';

let apiKey = null;
let adminApiKey = null;
let userId = null;
let organizationId = null;
let employmentId = null;
let outletId = null;
let warehouseId = null;
let productBlueprintId = null;
let customerId = null;
let salesId = null;
let salesNumber = null;
let salesData = null;
let productCategoryId = null;

let outletInventoryProductList = null;
let outletInventoryMatchingProductList = null;
let outletInventoryMatchingProductBlueprintList = null;

let outletDefaultInventoryId = null;
let outletReturnedInventoryId = null;
let outletDamagedInventoryId = null;

let warehouseDefaultInventoryId = null;

let customerData = null;

let productToBeTransferredId = null;

let invalidOrganizationId = generateInvalidId();
let invalidOutletId = generateInvalidId();
let invalidWarehouseId = generateInvalidId();
let invalidProductId = generateInvalidId();
let invalidCustomerId = generateInvalidId();
let invalidSalesId = generateInvalidId();
let invalidEmployeeId = generateInvalidId();
let invalidProductBlueprintId = generateInvalidId();
let invalidProductCategoryId = generateInvalidId();

let fromDate = new Date();
fromDate.setDate(fromDate.getDate() - 1);
fromDate = fromDate.getTime();

let monthsLaterDate = new Date();
monthsLaterDate.setMonth(monthsLaterDate.getMonth() + 3);
monthsLaterDate = monthsLaterDate.getTime();

let monthsEarlierDate = new Date();
monthsEarlierDate.setMonth(monthsEarlierDate.getMonth() - 3);
monthsEarlierDate = monthsEarlierDate.getTime();

let customerRef1 = null;

let basicServiceBlueprintId = null;
let basicService = null;
let basicServiceSaleId = null;
let customerAndEmployeeServiceBlueprintId = null;
let customerAndEmployeeService = null;
let longstandingServiceBlueprintId = null;
let longstandingService = null;
let longstandingServiceSaleId = null;

let placeholderDefaultDiscountType = 'percent';
let placeholderDefaultDiscountValue = 5;

let validDiscountPresetId = null;
let validDiscountPresetId2 = null;

describe('Sales', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      registerUser({
        password, fullName, phone
      }, (data) => {
        userId = data.userId;
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
            employmentId = data.employmentId;
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
                addWarehouse({
                  apiKey,
                  organizationId,
                  name: "Warehouse Name",
                  physicalAddress: "11xx Warehouse Physical Address",
                  phone: 'w1' + rnd(prefix, 11),
                  contactPersonName: "Warehouse Contact Person Name"
                }, (data) => {
                  warehouseId = data.warehouseId;
                  getWarehouse({
                    apiKey, warehouseId
                  }, (data) => {
                    warehouseDefaultInventoryId = data.defaultInventory.id;
                    addProductCategory({
                      apiKey,
                      organizationId,
                      name: "1st product category",
                      colorCode: "FFFFFF"
                    }, (data) => {
                      productCategoryId = data.productCategoryId;
                      addProductBlueprint({
                        apiKey,
                        organizationId,
                        name: productBlueprintName,
                        unit: "box",
                        identifierCode: '',
                        defaultPurchasePrice: 99,
                        defaultVat: 3,
                        defaultSalePrice: 112,
                        productCategoryIdList: [],
                        isReturnable: true
                      }, (data) => {
                        productBlueprintId = data.productBlueprintId;
                        addProductToInventory({
                          apiKey,
                          inventoryId: outletDefaultInventoryId,
                          productList: [
                            { productBlueprintId, count: 100 }
                          ],
                          vendorId: null
                        }, (data) => {
                          addProductToInventory({
                            apiKey,
                            inventoryId: warehouseDefaultInventoryId,
                            productList: [
                              { productBlueprintId, count: 100 }
                            ],
                            vendorId: null
                          }, (data) => {
                            addCustomer({
                              apiKey,
                              organizationId,
                              fullName: customerFullName,
                              phone: customerPhone,
                              email: null,
                              address: ''
                            }, (data) => {
                              customerId = data.customerId;
                              getCustomer({
                                apiKey, customerId
                              }, (data) => {
                                customerData = data.customer;
                                addServiceBlueprint({
                                  apiKey,
                                  organizationId,
                                  name: "1st service blueprint",
                                  defaultVat: 2,
                                  defaultSalePrice: 250,
                                  isLongstanding: false,
                                  serviceDuration: null,
                                  isEmployeeAssignable: false,
                                  isCustomerRequired: false,
                                  isRefundable: false,
                                  avtivateInAllOutlets: true
                                }, (data) => {
                                  basicServiceBlueprintId = data.serviceBlueprintId;
                                  addServiceBlueprint({
                                    apiKey,
                                    organizationId,
                                    name: "2nd service blueprint",
                                    defaultVat: 2,
                                    defaultSalePrice: 250,
                                    isLongstanding: false,
                                    serviceDuration: null,
                                    isEmployeeAssignable: true,
                                    isCustomerRequired: true,
                                    isRefundable: false,
                                    avtivateInAllOutlets: true
                                  }, (data) => {
                                    customerAndEmployeeServiceBlueprintId = data.serviceBlueprintId;
                                    addServiceBlueprint({
                                      apiKey,
                                      organizationId,
                                      name: "3rd long service blueprint",
                                      defaultVat: 2,
                                      defaultSalePrice: 250,
                                      isLongstanding: true,
                                      serviceDuration: {
                                        months: 1,
                                        days: 7
                                      },
                                      isEmployeeAssignable: true,
                                      isCustomerRequired: true,
                                      isRefundable: false,
                                      avtivateInAllOutlets: true
                                    }, (data) => {
                                      longstandingServiceBlueprintId = data.serviceBlueprintId;
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
        });
      });
    });
  });

  it('api/get-aggregated-inventory-details (Inventory check)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: outletDefaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);

      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(100);
      expect(body.aggregatedProductList[0]).to.have.property('productId');

      outletInventoryProductList = body.aggregatedProductList;
      outletInventoryMatchingProductBlueprintList = outletInventoryProductList.map(_product => _product.product.productBlueprint);

      testDoneFn();
    });

  });

  it('api/add-sales (Invalid outletId)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId: invalidOutletId,
        customerId: null,

        productList: [
          {
            productId: outletInventoryProductList[0].productId,
            count: 2,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountPresetId: null,
          discountType: placeholderDefaultDiscountType,
          discountValue: placeholderDefaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('OUTLET_INVALID');
      testDoneFn();
    });

  });

  it('api/add-sales (Invalid empty productList and serviceList)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountPresetId: null,
          discountType: placeholderDefaultDiscountType,
          discountValue: placeholderDefaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('NO_PRODUCT_OR_SERVICE_SELECTED');
      testDoneFn();
    });

  });

  it('api/add-sales (Invalid productList)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [
          {
            productId: invalidProductId,
            count: 2,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountPresetId: null,
          discountType: placeholderDefaultDiscountType,
          discountValue: placeholderDefaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('PRODUCT_INVALID');
      testDoneFn();
    });

  });

  it('api/add-sales (Invalid discountType)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [
          {
            productId: outletInventoryProductList[0].productId,
            count: 2,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountPresetId: null,
          discountType: 'something',
          discountValue: placeholderDefaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('VALIDATION_ERROR');
      testDoneFn();
    });

  });

  it('api/add-sales (Valid, No Customer)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [
          {
            productId: outletInventoryProductList[0].productId,
            count: 2,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountPresetId: null,
          discountType: placeholderDefaultDiscountType,
          discountValue: placeholderDefaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddSalesApiSuccessResponse(body);
      testDoneFn();
    });

  });

  // Lipi Lite - Start

  let liteProductBlueprintIdList = null;

  it('api/lite-add-sales (Valid, No Customer)', testDoneFn => {

    callApi('api/lite-add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [
          {
            productBlueprintId: null,
            name: "New Product",
            count: 5,
            salePrice: 500,
          }
        ],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          vatPercentage: 5,
          discountType: placeholderDefaultDiscountType,
          discountValue: placeholderDefaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          paymentMethod: 'cash'
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      liteProductBlueprintIdList = body.productBlueprintIdList;
      delete body.productBlueprintIdList;
      expect(liteProductBlueprintIdList.length).to.equal(1);

      validateAddSalesApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/lite-add-sales (Valid, No Customer, Existing Blueprint)', testDoneFn => {

    callApi('api/lite-add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [
          {
            productBlueprintId: liteProductBlueprintIdList[0].productBlueprintId,
            name: "New Product",
            count: 5,
            salePrice: 500,
          }
        ],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          vatPercentage: 5,
          discountType: placeholderDefaultDiscountType,
          discountValue: placeholderDefaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          paymentMethod: 'cash'
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      liteProductBlueprintIdList = body.productBlueprintIdList;
      delete body.productBlueprintIdList;
      validateAddSalesApiSuccessResponse(body);
      testDoneFn();
    });

  });

  // Lipi Lite - End

  it('api/add-sales (Invalid payment)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [
          {
            productId: outletInventoryProductList[0].productId,
            count: 2,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {},

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('VALIDATION_ERROR');
      testDoneFn();
    });

  });

  it('api/add-sales (Invalid, No Customer credit sale)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [
          {
            productId: outletInventoryProductList[0].productId,
            count: 2,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountPresetId: null,
          discountType: placeholderDefaultDiscountType,
          discountValue: placeholderDefaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 0,
          changeAmount: (0 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('CREDIT_SALE_NOT_ALLOWED_WITHOUT_CUSTOMER');
      testDoneFn();
    });

  });

  it('api/add-sales (Invalid customer)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: invalidCustomerId,

        productList: [
          {
            productId: outletInventoryProductList[0].productId,
            count: 2,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountPresetId: null,
          discountType: placeholderDefaultDiscountType,
          discountValue: placeholderDefaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('CUSTOMER_INVALID');
      testDoneFn();
    });

  });

  it('api/add-sales (Invalid, shouldSaveChangeInAccount with no module)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId,

        productList: [
          {
            productId: outletInventoryProductList[0].productId,
            count: 2,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountPresetId: null,
          discountType: placeholderDefaultDiscountType,
          discountValue: placeholderDefaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 1300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: true,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('UNMET_MODULE');
      testDoneFn();
    });

  });

  it('api/admin-login (Correct)', testDoneFn => {

    callApi('api/admin-login', {
      json: {
        username: 'default',
        password: 'johndoe1pass'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string');
      expect(body).to.have.property('sessionId').that.is.a('number');
      expect(body).to.have.property('admin').that.is.an('object');
      adminApiKey = body.apiKey;
      testDoneFn();
    })

  });

  it('api/admin-set-module-activation-status (Valid module)', testDoneFn => {

    callApi('api/admin-set-module-activation-status', {
      json: {
        apiKey: adminApiKey,
        organizationId: organizationId,
        moduleCode: "MOD_CUSTOMER_ACCOUNT_BALANCE",
        paymentReference: "joi test",
        action: 'activate'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(response.statusCode).to.equal(200);
      testDoneFn();
    });

  });

  it('api/user-login', testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: phone,
        password
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  it('api/add-sales (Valid, registered Customer)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId,

        productList: [
          {
            productId: outletInventoryProductList[0].productId,
            count: 2,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountPresetId: null,
          discountType: placeholderDefaultDiscountType,
          discountValue: placeholderDefaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 1300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: true,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddSalesApiSuccessResponse(body);

      salesId = body.salesId;
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid sales check)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: outletDefaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);

      body.aggregatedProductList.reverse(); // Because checks below rely on the item first entered in the list
      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(96);
      testDoneFn();
    });

  });

  it('api/get-sales (Invalid)', testDoneFn => {

    callApi('api/get-sales', {
      json: {
        apiKey,
        salesId: invalidSalesId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('SALES_INVALID');
      testDoneFn();
    });

  });

  it('api/get-sales (Valid)', testDoneFn => {

    callApi('api/get-sales', {
      json: {
        apiKey,
        salesId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetSalesApiSuccessResponse(body);
      validateSalesSchema(body.sales);

      salesData = body.sales;
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid; before sales return)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: outletDefaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);

      body.aggregatedProductList.reverse(); // Because checks below rely on the item first entered in the list

      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(96);
      testDoneFn();
    });

  });

  it('api/add-sales-return (Valid test purpose)', testDoneFn => {

    callApi('api/add-sales-return', {
      json: {
        apiKey,
        salesId,
        returnedProductList: [
          {
            productId: salesData.productList[0].productId,
            count: salesData.productList[0].count - 1
          }
        ],
        creditedAmount: 100,
        shouldSaveReturnableInChangeWallet: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddSalesReturnApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid sales return check)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: outletDefaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);

      body.aggregatedProductList.reverse(); // Because checks below rely on the item first entered in the list

      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(96);
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid sales return check)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: outletReturnedInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);

      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(1);
      testDoneFn();
    });

  });

  it('api/get-sales (Valid)', testDoneFn => {

    callApi('api/get-sales', {
      json: {
        apiKey,
        salesId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetSalesApiSuccessResponse(body);
      validateSalesSchema(body.sales);

      salesNumber = body.sales.salesNumber;
      testDoneFn();
    });

  });

  it('api/get-sales-list (Valid sales Id)', testDoneFn => {

    callApi('api/get-sales-list', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        customerId: null,

        shouldFilterByOutlet: false,
        shouldFilterByCustomer: false,

        fromDate,
        toDate: (new Date()).getTime(),
        includeExtendedInformation: true,

        searchString: String(salesNumber)
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetSalesListApiSuccessResponse(body);
      body.salesList.forEach(sales => {
        validateSalesSchemaWhenListObj(sales);
      });
      expect(body.salesList.length).to.equal(1);
      expect(body.salesList[0].id).to.equal(salesId);
      testDoneFn();
    });

  });

  it('api/get-sales-list (Valid only organization Id)', testDoneFn => {

    callApi('api/get-sales-list', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        customerId: null,

        shouldFilterByOutlet: false,
        shouldFilterByCustomer: false,

        fromDate,
        toDate: (new Date()).getTime(),
        includeExtendedInformation: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetSalesListApiSuccessResponse(body);
      body.salesList.forEach(sales => {
        validateSalesSchemaWhenListObj(sales);
      });
      testDoneFn();
    });

  });

  it('api/get-sales-list (Valid with organizationId and outletId)', testDoneFn => {

    callApi('api/get-sales-list', {
      json: {
        apiKey,
        organizationId,
        outletId,
        customerId: null,

        shouldFilterByOutlet: true,
        shouldFilterByCustomer: false,

        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetSalesListApiSuccessResponse(body);
      body.salesList.forEach(sales => {
        validateSalesSchemaWhenListObj(sales);
      });
      testDoneFn();
    });

  });

  it('api/get-sales-list (Valid with organizationId and Invalid outletId)', testDoneFn => {

    callApi('api/get-sales-list', {
      json: {
        apiKey,
        organizationId,
        outletId: invalidOutletId,
        customerId: null,

        shouldFilterByOutlet: true,
        shouldFilterByCustomer: false,

        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('OUTLET_INVALID');
      testDoneFn();
    });

  });

  it('api/get-sales-list (Valid with organizationId and customerId)', testDoneFn => {

    callApi('api/get-sales-list', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        customerId,

        shouldFilterByOutlet: false,
        shouldFilterByCustomer: true,

        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetSalesListApiSuccessResponse(body);
      body.salesList.forEach(sales => {
        validateSalesSchemaWhenListObj(sales);
      });
      testDoneFn();
    });

  });

  it('api/get-sales-list (Valid with organizationId and Invalid customerId)', testDoneFn => {

    callApi('api/get-sales-list', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        customerId: invalidCustomerId,

        shouldFilterByOutlet: false,
        shouldFilterByCustomer: true,

        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('CUSTOMER_INVALID');
      testDoneFn();
    });

  });

  it('api/get-sales-list (Valid with organizationId and Invalid customerId is null)', testDoneFn => {

    callApi('api/get-sales-list', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        customerId: null,

        shouldFilterByOutlet: false,
        shouldFilterByCustomer: true,

        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('CUSTOMER_INVALID');
      testDoneFn();
    });

  });

  it('api/get-sales-list (Valid with organizationId and Invalid outletId is null)', testDoneFn => {

    callApi('api/get-sales-list', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        customerId: null,

        shouldFilterByOutlet: true,
        shouldFilterByCustomer: false,

        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('OUTLET_INVALID');
      testDoneFn();
    });

  });

  it('api/get-sales-list (Valid with organizationId, outletId and customerId)', testDoneFn => {

    callApi('api/get-sales-list', {
      json: {
        apiKey,
        organizationId,
        outletId,
        customerId,

        shouldFilterByOutlet: true,
        shouldFilterByCustomer: true,

        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetSalesListApiSuccessResponse(body);
      body.salesList.forEach(sales => {
        validateSalesSchemaWhenListObj(sales);
      });
      testDoneFn();
    });

  });

  it('api/get-sales-list (Invalid organizationId, with valid outletId and customerId)', testDoneFn => {

    callApi('api/get-sales-list', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId,
        outletId,
        customerId,

        shouldFilterByOutlet: true,
        shouldFilterByCustomer: true,

        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('ORGANIZATION_INVALID');
      testDoneFn();
    });

  });

  // Report product sales - start 

  it('api/report-product-sales-details (Valid, No param)', testDoneFn => {

    callApi('api/report-product-sales-details', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        productCategoryIdList: [],
        productBlueprintIdList: [],
        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateReportProductSalesDetailsApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/report-product-sales-details (Invalid outletId)', testDoneFn => {

    callApi('api/report-product-sales-details', {
      json: {
        apiKey,
        organizationId,
        outletId: invalidOutletId,
        productCategoryIdList: [],
        productBlueprintIdList: [],
        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('OUTLET_INVALID');
      testDoneFn();
    });

  });

  it('api/report-product-sales-details (Invalid invalidProductCategoryId)', testDoneFn => {

    callApi('api/report-product-sales-details', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        productCategoryIdList: [invalidProductCategoryId],
        productBlueprintIdList: [],
        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('PRODUCT_CATEGORY_INVALID');
      testDoneFn();
    });

  });

  it('api/report-product-sales-details (Invalid invalidProductBlueprintId)', testDoneFn => {

    callApi('api/report-product-sales-details', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        productCategoryIdList: [],
        productBlueprintIdList: [invalidProductBlueprintId],
        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('PRODUCT_BLUEPRINT_INVALID');
      testDoneFn();
    });

  });

  it('api/report-product-sales-details (Valid)', testDoneFn => {

    callApi('api/report-product-sales-details', {
      json: {
        apiKey,
        organizationId,
        outletId: outletId,
        productCategoryIdList: [],
        productBlueprintIdList: [],
        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateReportProductSalesDetailsApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/report-product-sales-details (Invalid, both productCategoryIdList and productBlueprintIdList)', testDoneFn => {

    callApi('api/report-product-sales-details', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        productCategoryIdList: [productCategoryId],
        productBlueprintIdList: [productBlueprintId],
        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('PREDETERMINER_SETUP_INVALID');
      testDoneFn();
    });

  });

  // Report product sales - end

  it('api/discard-sales (Valid)', testDoneFn => {

    callApi('api/discard-sales', {
      json: {
        apiKey,
        salesId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/get-sales (Valid discard check)', testDoneFn => {

    callApi('api/get-sales', {
      json: {
        apiKey,
        salesId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetSalesApiSuccessResponse(body);
      validateSalesSchema(body.sales);

      expect(body.sales).to.have.property('isDiscarded').that.equals(true);

      // Check and make sure data has actually changed in database
      getAsyncDatabase().salesDiscard.findBySalesId({ salesId }).then((sales) => {

        expect(body.sales.productList[0].productId).to.equal(sales.returnedProductList[0].productId);
        expect(body.sales.productList[0].count - body.sales.productList[0].returnedProductCount).to.equal(sales.returnedProductList[0].count);

        testDoneFn();
      });

    });

  });

  it('api/get-aggregated-inventory-details (Valid. Makes sure discarded products are returned AND Already returned products are not returned again)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: outletDefaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);

      body.aggregatedProductList.reverse(); // Because checks below rely on the item first entered in the list

      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(97);

      callApi('api/get-aggregated-inventory-details', {
        json: {
          apiKey,
          inventoryId: outletReturnedInventoryId
        }
      }, (err, response, body) => {
        expect(response.statusCode).to.equal(200);
        validateGetAggregatedInventoryDetailsApiSuccessResponse(body);

        expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(1);
        testDoneFn();
      });

    });

  });

  // WithdrawFromChangeWalletBalanceApi tests - start

  it('api/withdraw-from-change-wallet-balance (Invalid customerId)', testDoneFn => {

    callApi('api/withdraw-from-change-wallet-balance', {
      json: {
        apiKey,
        customerId: invalidCustomerId,
        amount: 50
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('CUSTOMER_INVALID');
      testDoneFn();
    });

  });

  it('api/withdraw-from-change-wallet-balance (Invalid amount)', testDoneFn => {

    callApi('api/withdraw-from-change-wallet-balance', {
      json: {
        apiKey,
        customerId,
        amount: -50
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('VALIDATION_ERROR');
      testDoneFn();
    });

  });

  it('api/withdraw-from-change-wallet-balance (Invalid amount)', testDoneFn => {

    callApi('api/withdraw-from-change-wallet-balance', {
      json: {
        apiKey,
        customerId,
        amount: 3000
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('INSUFFICIENT_BALANCE');
      testDoneFn();
    });

  });

  it('api/admin-login (Correct)', testDoneFn => {

    callApi('api/admin-login', {
      json: {
        username: 'default',
        password: 'johndoe1pass'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string');
      expect(body).to.have.property('sessionId').that.is.a('number');
      expect(body).to.have.property('admin').that.is.an('object');
      adminApiKey = body.apiKey;
      testDoneFn();
    })

  });

  it('api/admin-set-module-activation-status (Valid module)', testDoneFn => {

    callApi('api/admin-set-module-activation-status', {
      json: {
        apiKey: adminApiKey,
        organizationId: organizationId,
        moduleCode: "MOD_CUSTOMER_ACCOUNT_BALANCE",
        paymentReference: "joi test",
        action: 'deactivate'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(response.statusCode).to.equal(200);
      testDoneFn();
    });

  });

  it('api/user-login', testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: phone,
        password
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  it('api/withdraw-from-change-wallet-balance (Invalid, no module)', testDoneFn => {

    callApi('api/withdraw-from-change-wallet-balance', {
      json: {
        apiKey,
        customerId,
        amount: 50.9
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal("UNMET_MODULE");
      testDoneFn();
    });

  });

  it('api/admin-login (Correct)', testDoneFn => {

    callApi('api/admin-login', {
      json: {
        username: 'default',
        password: 'johndoe1pass'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('apiKey').that.is.a('string');
      expect(body).to.have.property('sessionId').that.is.a('number');
      expect(body).to.have.property('admin').that.is.an('object');
      adminApiKey = body.apiKey;
      testDoneFn();
    })

  });

  it('api/admin-set-module-activation-status (Valid module)', testDoneFn => {

    callApi('api/admin-set-module-activation-status', {
      json: {
        apiKey: adminApiKey,
        organizationId: organizationId,
        moduleCode: "MOD_CUSTOMER_ACCOUNT_BALANCE",
        paymentReference: "joi test",
        action: 'activate'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(response.statusCode).to.equal(200);
      testDoneFn();
    });

  });

  it('api/user-login', testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: phone,
        password
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  it('api/withdraw-from-change-wallet-balance (Valid)', testDoneFn => {

    callApi('api/withdraw-from-change-wallet-balance', {
      json: {
        apiKey,
        customerId,
        amount: 50.9
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/get-customer (changeWalletBalance check)', testDoneFn => {

    callApi('api/get-customer', {
      json: {
        apiKey,
        customerId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetCustomerApiSuccessResponse(body);
      validateCustomerSchema(body.customer);

      expect(body.customer).to.have.property('withdrawalHistory').to.have.lengthOf(1);

      testDoneFn();
    })

  });

  // WithdrawFromChangeWalletBalanceApi tests - end

  // AddAdditionalPayment tests - start

  it('api/add-sales (Valid, Credit Sale With Customer)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId,

        productList: [
          {
            productId: outletInventoryProductList[0].productId,
            count: 3,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountPresetId: null,
          discountType: placeholderDefaultDiscountType,
          discountValue: 0,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 30, // out of total billed 212.799999999
          changeAmount: 0,
          shouldSaveChangeInAccount: true,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddSalesApiSuccessResponse(body);

      salesId = body.salesId;
      testDoneFn();
    });

  });

  it('api/add-additional-payment (Valid, cash, Less than total billed)', testDoneFn => {

    callApi('api/add-additional-payment', {
      json: {
        apiKey,
        salesId,
        customerId,
        payment: {
          paidAmount: 20,
          changeAmount: 0,
          shouldSaveChangeInAccount: true,
          paymentMethod: 'cash'
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/add-additional-payment (Valid, change-wallet, Less than total billed, user has that amount)', testDoneFn => {

    callApi('api/add-additional-payment', {
      json: {
        apiKey,
        salesId,
        customerId,
        payment: {
          paidAmount: 10,
          changeAmount: 0,
          shouldSaveChangeInAccount: true,
          paymentMethod: 'change-wallet'
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/add-additional-payment (Invalid, change-wallet, Less than total billed, user does not have that amount)', testDoneFn => {

    callApi('api/add-additional-payment', {
      json: {
        apiKey,
        salesId,
        customerId,
        payment: {
          paidAmount: 60,
          changeAmount: 0,
          shouldSaveChangeInAccount: true,
          paymentMethod: 'change-wallet'
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('INSUFFICIENT_BALANCE');
      testDoneFn();
    });

  });

  it('api/add-additional-payment (Invalid, cash, incorrect change calculation)', testDoneFn => {

    callApi('api/add-additional-payment', {
      json: {
        apiKey,
        salesId,
        customerId,
        payment: {
          paidAmount: 20,
          changeAmount: 5,
          shouldSaveChangeInAccount: true,
          paymentMethod: 'cash'
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('INCORRECT_PAYMENT_CALCULATION');
      testDoneFn();
    });

  });

  it('api/get-customer (to verify impact of add-additional-payment)', testDoneFn => {

    callApi('api/get-customer', {
      json: {
        apiKey,
        customerId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetCustomerApiSuccessResponse(body);
      validateCustomerSchema(body.customer);
      customerRef1 = body.customer;
      expect(body.customer).to.have.property('withdrawalHistory').to.have.lengthOf(1);

      testDoneFn();
    })

  });

  it('api/add-additional-payment (Valid, cash, Greater than remaining)', testDoneFn => {

    callApi('api/add-additional-payment', {
      json: {
        apiKey,
        salesId,
        customerId,
        payment: {
          paidAmount: 180,
          changeAmount: 16,
          shouldSaveChangeInAccount: true,
          paymentMethod: 'cash'
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/get-customer (to verify impact of add-additional-payment)', testDoneFn => {

    callApi('api/get-customer', {
      json: {
        apiKey,
        customerId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetCustomerApiSuccessResponse(body);
      validateCustomerSchema(body.customer);
      let diff = body.customer.changeWalletBalance - customerRef1.changeWalletBalance;
      diff = Math.round(diff * 100) / 100;
      expect(diff).to.equal(16)
      testDoneFn();
    })

  });

  // AddAdditionalPayment tests - end

  // Service Sales - start

  it('api/get-active-service-list (Valid)', testDoneFn => {

    callApi('api/get-active-service-list', {
      json: {
        apiKey,
        outletId,
        searchString: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetActiveServiceListApiSuccessResponse(body);
      body.serviceList.forEach(service => {
        validateServiceSchema(service);
      });

      basicService = body.serviceList.find(service => service.serviceBlueprintId === basicServiceBlueprintId);
      customerAndEmployeeService = body.serviceList.find(service => service.serviceBlueprintId === customerAndEmployeeServiceBlueprintId);
      longstandingService = body.serviceList.find(service => service.serviceBlueprintId === longstandingServiceBlueprintId);

      testDoneFn();
    });

  });

  it('api/add-sales (Invalid employee assignment)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [],

        serviceList: [
          {
            serviceId: basicService.id,
            salePrice: basicService.salePrice,
            vatPercentage: basicService.serviceBlueprint.defaultVat,
            assignedEmploymentId: 99
          }
        ],

        payment: {
          totalAmount: basicService.salePrice,
          vatAmount: (basicService.salePrice * (basicService.serviceBlueprint.defaultVat / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: basicService.salePrice + (basicService.salePrice * (basicService.serviceBlueprint.defaultVat / 100)),
          paidAmount: 1000,
          changeAmount: (1000 - (basicService.salePrice + (basicService.salePrice * (basicService.serviceBlueprint.defaultVat / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('CANT_ASSIGN_EMPLOYEE_TO_SERVICE');
      testDoneFn();
    });

  });

  it('api/add-sales (Valid, basic service)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [],

        serviceList: [
          {
            serviceId: basicService.id,
            salePrice: basicService.salePrice,
            vatPercentage: basicService.serviceBlueprint.defaultVat,
            assignedEmploymentId: null
          }
        ],

        payment: {
          totalAmount: basicService.salePrice,
          vatAmount: (basicService.salePrice * (basicService.serviceBlueprint.defaultVat / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: basicService.salePrice + (basicService.salePrice * (basicService.serviceBlueprint.defaultVat / 100)),
          paidAmount: 1000,
          changeAmount: (1000 - (basicService.salePrice + (basicService.salePrice * (basicService.serviceBlueprint.defaultVat / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddSalesApiSuccessResponse(body);
      basicServiceSaleId = body.salesId;
      testDoneFn();
    });

  });

  it('api/get-sales (Valid service sale)', testDoneFn => {

    callApi('api/get-sales', {
      json: {
        apiKey,
        salesId: basicServiceSaleId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetSalesApiSuccessResponse(body);
      validateSalesSchema(body.sales);
      testDoneFn();
    });

  });

  it('api/add-sales (Invalid no customer)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [],

        serviceList: [
          {
            serviceId: customerAndEmployeeService.id,
            salePrice: customerAndEmployeeService.salePrice,
            vatPercentage: customerAndEmployeeService.serviceBlueprint.defaultVat,
            assignedEmploymentId: null
          }
        ],

        payment: {
          totalAmount: customerAndEmployeeService.salePrice,
          vatAmount: (customerAndEmployeeService.salePrice * (customerAndEmployeeService.serviceBlueprint.defaultVat / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (customerAndEmployeeService.salePrice + (customerAndEmployeeService.salePrice * (customerAndEmployeeService.serviceBlueprint.defaultVat / 100))),
          paidAmount: 1000,
          changeAmount: 1000 - (customerAndEmployeeService.salePrice + (customerAndEmployeeService.salePrice * (customerAndEmployeeService.serviceBlueprint.defaultVat / 100))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('SERVICE_REQUIRES_CUSTOMER');
      testDoneFn();
    });

  });

  it('api/add-sales (Invalid assigned employee)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId,

        productList: [],

        serviceList: [
          {
            serviceId: customerAndEmployeeService.id,
            salePrice: customerAndEmployeeService.salePrice,
            vatPercentage: customerAndEmployeeService.serviceBlueprint.defaultVat,
            assignedEmploymentId: invalidEmployeeId
          }
        ],

        payment: {
          totalAmount: customerAndEmployeeService.salePrice,
          vatAmount: (customerAndEmployeeService.salePrice * (customerAndEmployeeService.serviceBlueprint.defaultVat / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (customerAndEmployeeService.salePrice + (customerAndEmployeeService.salePrice * (customerAndEmployeeService.serviceBlueprint.defaultVat / 100))),
          paidAmount: 1000,
          changeAmount: 1000 - (customerAndEmployeeService.salePrice + (customerAndEmployeeService.salePrice * (customerAndEmployeeService.serviceBlueprint.defaultVat / 100))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('ASSIGNED_EMPLOYEE_INVALID');
      testDoneFn();
    });

  });

  it('api/add-sales (Invalid customerId longstandingService)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [],

        serviceList: [
          {
            serviceId: longstandingService.id,
            salePrice: longstandingService.salePrice,
            vatPercentage: longstandingService.serviceBlueprint.defaultVat,
            assignedEmploymentId: null
          }
        ],

        payment: {
          totalAmount: longstandingService.salePrice,
          vatAmount: (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          paidAmount: 1000,
          changeAmount: 1000 - (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('SERVICE_REQUIRES_CUSTOMER');
      testDoneFn();
    });

  });

  it('api/add-sales (Valid longstandingService)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId,

        productList: [],

        serviceList: [
          {
            serviceId: longstandingService.id,
            salePrice: longstandingService.salePrice,
            vatPercentage: longstandingService.serviceBlueprint.defaultVat,
            assignedEmploymentId: employmentId
          }
        ],

        payment: {
          totalAmount: longstandingService.salePrice,
          vatAmount: (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          paidAmount: 1000,
          changeAmount: 1000 - (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddSalesApiSuccessResponse(body);
      longstandingServiceSaleId = body.salesId;
      testDoneFn();
    });

  });

  it('api/discard-sales (Valid)', testDoneFn => {

    callApi('api/discard-sales', {
      json: {
        apiKey,
        salesId: longstandingServiceSaleId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/get-sales (Valid discard check)', testDoneFn => {

    callApi('api/get-sales', {
      json: {
        apiKey,
        salesId: longstandingServiceSaleId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetSalesApiSuccessResponse(body);
      validateSalesSchema(body.sales);

      expect(body.sales).to.have.property('isDiscarded').that.equals(true);
      testDoneFn();
    });

  });

  // Service Sales - end

  it('api/get-sales-list (Valid only organization Id and includeExtendedInformation)', testDoneFn => {

    callApi('api/get-sales-list', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        customerId: null,

        shouldFilterByOutlet: false,
        shouldFilterByCustomer: false,

        fromDate,
        toDate: (new Date()).getTime(),
        includeExtendedInformation: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetSalesListApiSuccessResponse(body);
      body.salesList.forEach(sales => {
        validateSalesSchemaWhenListObj(sales);
      });
      testDoneFn();
    });

  });

  // Graph Sales - Start

  it('api/graph-sales-trend (Valid only organization Id, periodLevel: week )', testDoneFn => {

    localFromDate = fromDate;

    callApi('api/graph-sales-trend', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        fromDate: localFromDate,
        periodLevel: 'week'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGraphSalesApiSuccessResponse(body);
      let { labelList, sumTotalBilledList, sumCountList } = body.graphData;
      expect(labelList.length).to.equal(7);

      testDoneFn();
    });

  });

  it('api/graph-sales-trend (Valid only organization Id, periodLevel: month )', testDoneFn => {

    localFromDate = fromDate;

    callApi('api/graph-sales-trend', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        fromDate: localFromDate,
        periodLevel: 'month'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGraphSalesApiSuccessResponse(body);
      let { labelList, sumTotalBilledList, sumCountList } = body.graphData;
      expect(labelList.length >= 28).to.equal(true);
      expect(labelList.length <= 31).to.equal(true);

      testDoneFn();
    });

  });

  it('api/graph-sales-trend (Valid only organization Id, periodLevel: year-monthly )', testDoneFn => {

    localFromDate = fromDate;

    callApi('api/graph-sales-trend', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        fromDate: localFromDate,
        periodLevel: 'year-monthly'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGraphSalesApiSuccessResponse(body);
      let { labelList, sumTotalBilledList, sumCountList } = body.graphData;
      expect(labelList.length).to.equal(12);

      testDoneFn();
    });

  });

  it('api/graph-sales-trend (Valid only organization Id, periodLevel: year-quarterly )', testDoneFn => {

    localFromDate = fromDate;

    callApi('api/graph-sales-trend', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        fromDate: localFromDate,
        periodLevel: 'year-quarterly'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGraphSalesApiSuccessResponse(body);
      let { labelList, sumTotalBilledList, sumCountList } = body.graphData;
      expect(labelList.length).to.equal(4);

      testDoneFn();
    });

  });

  // Graph Sales - End

  // Collection Report - Start

  it('api/report-collection-details (Valid)', testDoneFn => {

    callApi('api/report-collection-details', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        customerId: null,

        shouldFilterByOutlet: false,
        shouldFilterByCustomer: false,

        paymentMethod: null,

        fromDate: monthsEarlierDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateReportCollectionDetailsApiSuccessResponse(body);
      body.collectionList.forEach(doc => {
        validateCollectionSchema(doc);
      });
      testDoneFn();
    });

  });

  it('api/report-collection-details (Valid, paymentMethod Filter)', testDoneFn => {

    callApi('api/report-collection-details', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        customerId: null,

        shouldFilterByOutlet: false,
        shouldFilterByCustomer: false,

        paymentMethod: 'cash',

        fromDate: monthsEarlierDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateReportCollectionDetailsApiSuccessResponse(body);
      body.collectionList.forEach(doc => {
        expect(doc.paymentMethod).to.equal('cash')
        validateCollectionSchema(doc);
      });
      testDoneFn();
    });

  });

  // Collection Report - End

  // Service Membership - start

  it('api/get-service-membership-list (Valid no filter. Only one entry. (created above))', testDoneFn => {

    callApi('api/get-service-membership-list', {
      json: {
        apiKey,
        organizationId,
        serviceBlueprintId: null,
        outletId: null,
        customerId: null,

        shouldFilterByServiceBlueprint: false,
        shouldFilterByOutlet: false,
        shouldFilterByCustomer: false,

        fromDate: monthsEarlierDate,
        toDate: monthsLaterDate
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetServiceMembershipListApiSuccessResponse(body);
      body.serviceMembershipList.forEach(serviceMembership => {
        validateServiceMembershipSchemaWhenListObj(serviceMembership);
      });
      testDoneFn();
    });

  });

  let membershipTest = {
    organizationId,
    customer1Id: null,
    customer2Id: null,
    customer1Phone: 'c1' + rnd(prefix, 11),
    customer2Phone: 'c2' + rnd(prefix, 11),
    outlet1Id: null,
    outlet2Id: null,
    serviceBlueprint1Id: null,
    serviceBlueprint2Id: null
  }

  it('Preparing for service-membership test', testDoneFn => {
    let { promisifyApiCall } = require('./lib');

    Promise.resolve()
      .then(() => promisifyApiCall({}, addOrganization, {
        apiKey,
        name: orgName,
        primaryBusinessAddress: orgBusinessAddress,
        phone: orgPhone,
        email: orgEmail
      }))
      .then(({ organizationId }) => membershipTest.organizationId = organizationId)

      .then(() => promisifyApiCall({}, addCustomer, {
        apiKey,
        organizationId: membershipTest.organizationId,
        fullName: customerFullName,
        phone: membershipTest.customer1Phone,
        email: null,
        address: ''
      }))
      .then(({ customerId }) => membershipTest.customer1Id = customerId)

      .then(() => promisifyApiCall({}, addCustomer, {
        apiKey,
        organizationId: membershipTest.organizationId,
        fullName: customerFullName,
        phone: membershipTest.customer2Phone,
        email: null,
        address: ''
      }))
      .then(({ customerId }) => membershipTest.customer2Id = customerId)

      .then(() => promisifyApiCall({}, addOutlet, {
        apiKey,
        organizationId: membershipTest.organizationId,
        name: outletName,
        physicalAddress: outletPhysicalAddress,
        phone: outletPhone,
        contactPersonName: outletContactPersonName,
        location: { lat: 23.7945153, lng: 90.4139857 },
        categoryCode: 'CAT_GENERAL'
      }))
      .then(({ outletId }) => membershipTest.outlet1Id = outletId)

      .then(() => promisifyApiCall({}, addOutlet, {
        apiKey,
        organizationId: membershipTest.organizationId,
        name: outletName,
        physicalAddress: outletPhysicalAddress,
        phone: outletPhone,
        contactPersonName: outletContactPersonName,
        location: { lat: 23.7945153, lng: 90.4139857 },
        categoryCode: 'CAT_GENERAL'
      }))
      .then(({ outletId }) => membershipTest.outlet2Id = outletId)

      // longstanding ServiceBlueprint1
      .then(() => promisifyApiCall({}, addServiceBlueprint, {
        apiKey,
        organizationId: membershipTest.organizationId,
        name: "Long 1",
        defaultVat: 2,
        defaultSalePrice: 250,
        isLongstanding: true,
        serviceDuration: {
          months: 1,
          days: 7
        },
        isEmployeeAssignable: true,
        isCustomerRequired: true,
        isRefundable: false,
        avtivateInAllOutlets: true
      }))
      .then(({ serviceBlueprintId }) => membershipTest.serviceBlueprint1Id = serviceBlueprintId)

      // longstanding ServiceBlueprint2
      .then(() => promisifyApiCall({}, addServiceBlueprint, {
        apiKey,
        organizationId: membershipTest.organizationId,
        name: "Long 2",
        defaultVat: 2,
        defaultSalePrice: 250,
        isLongstanding: true,
        serviceDuration: {
          months: 1,
          days: 7
        },
        isEmployeeAssignable: true,
        isCustomerRequired: true,
        isRefundable: false,
        avtivateInAllOutlets: true
      }))
      .then(({ serviceBlueprintId }) => membershipTest.serviceBlueprint2Id = serviceBlueprintId)

      // get active service list (outlet1)
      .then(() => promisifyApiCall({}, getActiveServiceList, {
        apiKey,
        outletId: membershipTest.outlet1Id,
        searchString: ''
      }))
      .then((body) => {
        membershipTest.outlet1ServiceList = body.serviceList;
      })

      // get active service list (outlet2)
      .then(() => promisifyApiCall({}, getActiveServiceList, {
        apiKey,
        outletId: membershipTest.outlet2Id,
        searchString: ''
      }))
      .then((body) => {
        membershipTest.outlet2ServiceList = body.serviceList;
      })

      // add sale - outlet 1, customer 1, service 1
      .then(() => { longstandingService = membershipTest.outlet1ServiceList.find(i => i.serviceBlueprint.name === 'Long 1'); return Promise.resolve() })
      .then(() => promisifyApiCall({}, addSales, {
        apiKey,
        outletId: membershipTest.outlet1Id,
        customerId: membershipTest.customer1Id,
        productList: [],
        serviceList: [
          {
            serviceId: longstandingService.id,
            salePrice: longstandingService.salePrice,
            vatPercentage: longstandingService.serviceBlueprint.defaultVat,
            assignedEmploymentId: null
          }
        ],
        payment: {
          totalAmount: longstandingService.salePrice,
          vatAmount: (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          paidAmount: 1000,
          changeAmount: 1000 - (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }))
      .then((body) => { })

      // add sale - outlet 1, customer 1, service 2
      .then(() => { longstandingService = membershipTest.outlet1ServiceList.find(i => i.serviceBlueprint.name === 'Long 2'); return Promise.resolve() })
      .then(() => promisifyApiCall({}, addSales, {
        apiKey,
        outletId: membershipTest.outlet1Id,
        customerId: membershipTest.customer1Id,
        productList: [],
        serviceList: [
          {
            serviceId: longstandingService.id,
            salePrice: longstandingService.salePrice,
            vatPercentage: longstandingService.serviceBlueprint.defaultVat,
            assignedEmploymentId: null
          }
        ],
        payment: {
          totalAmount: longstandingService.salePrice,
          vatAmount: (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          paidAmount: 1000,
          changeAmount: 1000 - (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }))
      .then((body) => { })

      // add sale - outlet 1, customer 2, service 2
      .then(() => { longstandingService = membershipTest.outlet1ServiceList.find(i => i.serviceBlueprint.name === 'Long 2'); return Promise.resolve() })
      .then(() => promisifyApiCall({}, addSales, {
        apiKey,
        outletId: membershipTest.outlet1Id,
        customerId: membershipTest.customer2Id,
        productList: [],
        serviceList: [
          {
            serviceId: longstandingService.id,
            salePrice: longstandingService.salePrice,
            vatPercentage: longstandingService.serviceBlueprint.defaultVat,
            assignedEmploymentId: null
          }
        ],
        payment: {
          totalAmount: longstandingService.salePrice,
          vatAmount: (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          paidAmount: 1000,
          changeAmount: 1000 - (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }))
      .then((body) => { })

      // add sale - outlet 2, customer 1, service 1
      .then(() => { longstandingService = membershipTest.outlet2ServiceList.find(i => i.serviceBlueprint.name === 'Long 1'); return Promise.resolve() })
      .then(() => promisifyApiCall({}, addSales, {
        apiKey,
        outletId: membershipTest.outlet2Id,
        customerId: membershipTest.customer1Id,
        productList: [],
        serviceList: [
          {
            serviceId: longstandingService.id,
            salePrice: longstandingService.salePrice,
            vatPercentage: longstandingService.serviceBlueprint.defaultVat,
            assignedEmploymentId: null
          }
        ],
        payment: {
          totalAmount: longstandingService.salePrice,
          vatAmount: (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          paidAmount: 1000,
          changeAmount: 1000 - (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }))
      .then((body) => { })

      // add sale - outlet 2, customer 2, service 1
      .then(() => { longstandingService = membershipTest.outlet2ServiceList.find(i => i.serviceBlueprint.name === 'Long 1'); return Promise.resolve() })
      .then(() => promisifyApiCall({}, addSales, {
        apiKey,
        outletId: membershipTest.outlet2Id,
        customerId: membershipTest.customer2Id,
        productList: [],
        serviceList: [
          {
            serviceId: longstandingService.id,
            salePrice: longstandingService.salePrice,
            vatPercentage: longstandingService.serviceBlueprint.defaultVat,
            assignedEmploymentId: null
          }
        ],
        payment: {
          totalAmount: longstandingService.salePrice,
          vatAmount: (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          paidAmount: 1000,
          changeAmount: 1000 - (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }))
      .then((body) => { })

      .then(() => {
        // console.log('final test object', membershipTest);
        testDoneFn();
      });

  });

  it('api/get-service-membership-list (Filters: orgnization)', testDoneFn => {

    callApi('api/get-service-membership-list', {
      json: {
        apiKey,
        organizationId: membershipTest.organizationId,
        serviceBlueprintId: null,
        outletId: null,
        customerId: null,

        shouldFilterByServiceBlueprint: false,
        shouldFilterByOutlet: false,
        shouldFilterByCustomer: false,

        fromDate: monthsEarlierDate,
        toDate: monthsLaterDate
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetServiceMembershipListApiSuccessResponse(body);
      body.serviceMembershipList.forEach(serviceMembership => {
        validateServiceMembershipSchemaWhenListObj(serviceMembership);
      });
      expect(body.serviceMembershipList.length).to.equal(5);
      testDoneFn();
    });

  });

  it('api/get-service-membership-list (Filters: orgnization, outlet: 1)', testDoneFn => {

    callApi('api/get-service-membership-list', {
      json: {
        apiKey,
        organizationId: membershipTest.organizationId,
        serviceBlueprintId: null,
        outletId: membershipTest.outlet1Id,
        customerId: null,

        shouldFilterByServiceBlueprint: false,
        shouldFilterByOutlet: true,
        shouldFilterByCustomer: false,

        fromDate: monthsEarlierDate,
        toDate: monthsLaterDate
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetServiceMembershipListApiSuccessResponse(body);
      body.serviceMembershipList.forEach(serviceMembership => {
        validateServiceMembershipSchemaWhenListObj(serviceMembership);
      });
      expect(body.serviceMembershipList.length).to.equal(3);
      testDoneFn();
    });

  });

  it('api/get-service-membership-list (Filters: orgnization, outlet: 1, customer: 1)', testDoneFn => {

    callApi('api/get-service-membership-list', {
      json: {
        apiKey,
        organizationId: membershipTest.organizationId,
        serviceBlueprintId: null,
        outletId: membershipTest.outlet1Id,
        customerId: membershipTest.customer1Id,

        shouldFilterByServiceBlueprint: false,
        shouldFilterByOutlet: true,
        shouldFilterByCustomer: true,

        fromDate: monthsEarlierDate,
        toDate: monthsLaterDate
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetServiceMembershipListApiSuccessResponse(body);
      body.serviceMembershipList.forEach(serviceMembership => {
        validateServiceMembershipSchemaWhenListObj(serviceMembership);
      });
      expect(body.serviceMembershipList.length).to.equal(2);
      testDoneFn();
    });

  });

  it('api/get-service-membership-list (Filters: orgnization, outlet: 1, customer: 2)', testDoneFn => {

    callApi('api/get-service-membership-list', {
      json: {
        apiKey,
        organizationId: membershipTest.organizationId,
        serviceBlueprintId: null,
        outletId: membershipTest.outlet1Id,
        customerId: membershipTest.customer2Id,

        shouldFilterByServiceBlueprint: false,
        shouldFilterByOutlet: true,
        shouldFilterByCustomer: true,

        fromDate: monthsEarlierDate,
        toDate: monthsLaterDate
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetServiceMembershipListApiSuccessResponse(body);
      body.serviceMembershipList.forEach(serviceMembership => {
        validateServiceMembershipSchemaWhenListObj(serviceMembership);
      });
      expect(body.serviceMembershipList.length).to.equal(1);
      testDoneFn();
    });

  });

  it('api/get-service-membership-list (Filters: orgnization, customer: 1)', testDoneFn => {

    callApi('api/get-service-membership-list', {
      json: {
        apiKey,
        organizationId: membershipTest.organizationId,
        serviceBlueprintId: null,
        outletId: null,
        customerId: membershipTest.customer1Id,

        shouldFilterByServiceBlueprint: false,
        shouldFilterByOutlet: false,
        shouldFilterByCustomer: true,

        fromDate: monthsEarlierDate,
        toDate: monthsLaterDate
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetServiceMembershipListApiSuccessResponse(body);
      body.serviceMembershipList.forEach(serviceMembership => {
        validateServiceMembershipSchemaWhenListObj(serviceMembership);
      });
      expect(body.serviceMembershipList.length).to.equal(3);
      testDoneFn();
    });

  });

  it('api/get-service-membership-list (Filters: orgnization, serviceBlueprint: 1)', testDoneFn => {

    callApi('api/get-service-membership-list', {
      json: {
        apiKey,
        organizationId: membershipTest.organizationId,
        serviceBlueprintId: membershipTest.serviceBlueprint1Id,
        outletId: null,
        customerId: null,

        shouldFilterByServiceBlueprint: true,
        shouldFilterByOutlet: false,
        shouldFilterByCustomer: false,

        fromDate: monthsEarlierDate,
        toDate: monthsLaterDate
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetServiceMembershipListApiSuccessResponse(body);
      body.serviceMembershipList.forEach(serviceMembership => {
        validateServiceMembershipSchemaWhenListObj(serviceMembership);
      });
      expect(body.serviceMembershipList.length).to.equal(3);
      testDoneFn();
    });

  });

  it('api/get-service-membership-list (Filters: orgnization, serviceBlueprint: 2)', testDoneFn => {

    callApi('api/get-service-membership-list', {
      json: {
        apiKey,
        organizationId: membershipTest.organizationId,
        serviceBlueprintId: membershipTest.serviceBlueprint2Id,
        outletId: null,
        customerId: null,

        shouldFilterByServiceBlueprint: true,
        shouldFilterByOutlet: false,
        shouldFilterByCustomer: false,

        fromDate: monthsEarlierDate,
        toDate: monthsLaterDate
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetServiceMembershipListApiSuccessResponse(body);
      body.serviceMembershipList.forEach(serviceMembership => {
        validateServiceMembershipSchemaWhenListObj(serviceMembership);
      });
      expect(body.serviceMembershipList.length).to.equal(2);
      testDoneFn();
    });

  });

  it('api/get-service-membership-list (Filters: orgnization, outlet: 1, customer: 1, serviceBlueprint: 1)', testDoneFn => {

    callApi('api/get-service-membership-list', {
      json: {
        apiKey,
        organizationId: membershipTest.organizationId,
        serviceBlueprintId: membershipTest.serviceBlueprint1Id,
        outletId: membershipTest.outlet1Id,
        customerId: membershipTest.customer1Id,

        shouldFilterByServiceBlueprint: true,
        shouldFilterByOutlet: true,
        shouldFilterByCustomer: true,

        fromDate: monthsEarlierDate,
        toDate: monthsLaterDate
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetServiceMembershipListApiSuccessResponse(body);
      body.serviceMembershipList.forEach(serviceMembership => {
        validateServiceMembershipSchemaWhenListObj(serviceMembership);
      });
      expect(body.serviceMembershipList.length).to.equal(1);
      testDoneFn();
    });

  });

  // Service Membership - end

  // Discount Preset - start

  it('api/add-discount-preset (Invalid)', testDoneFn => {

    callApi('api/add-discount-preset', {
      json: {
        apiKey,
        organizationId, name: 'I know its invalid 100', discountType: 'percent', discountValue: 5000
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      testDoneFn();
    });

  });

  it('api/add-discount-preset (Invalid)', testDoneFn => {

    callApi('api/add-discount-preset', {
      json: {
        apiKey,
        organizationId: -2, name: 'I know its invalid 100', discountType: 'percent', discountValue: 5000
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      testDoneFn();
    });

  });

  it('api/add-discount-preset (Valid)', testDoneFn => {

    callApi('api/add-discount-preset', {
      json: {
        apiKey,
        organizationId, name: 'Test 100', discountType: 'percent', discountValue: 5
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddDiscountPresetApiSuccessResponse(body);
      validDiscountPresetId = body.discountPresetId;
      testDoneFn();
    });

  });

  it('api/edit-discount-preset (Valid)', testDoneFn => {

    callApi('api/edit-discount-preset', {
      json: {
        apiKey,
        discountPresetId: validDiscountPresetId, name: 'Test 100', discountType: 'percent', discountValue: 10
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/add-discount-preset (Valid)', testDoneFn => {

    callApi('api/add-discount-preset', {
      json: {
        apiKey,
        organizationId, name: 'Test 200', discountType: 'percent', discountValue: 5
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddDiscountPresetApiSuccessResponse(body);
      validDiscountPresetId2 = body.discountPresetId;
      testDoneFn();
    });

  });

  it('api/get-discount-preset-list (Valid)', testDoneFn => {

    callApi('api/get-discount-preset-list', {
      json: {
        apiKey,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetDiscountPresetListApiSuccessResponse(body);

      body.discountPresetList.forEach(outlet => {
        validateDiscountPresetSchema(outlet);
      });
      let discountPresetList = body.discountPresetList;
      expect(discountPresetList.length).to.equal(2);

      testDoneFn();
    });

  });

  it('api/delete-discount-preset (Valid)', testDoneFn => {

    callApi('api/delete-discount-preset', {
      json: {
        apiKey,
        discountPresetId: validDiscountPresetId2
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/get-discount-preset-list (Valid)', testDoneFn => {

    callApi('api/get-discount-preset-list', {
      json: {
        apiKey,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetDiscountPresetListApiSuccessResponse(body);

      body.discountPresetList.forEach(outlet => {
        validateDiscountPresetSchema(outlet);
      });
      let discountPresetList = body.discountPresetList;
      expect(discountPresetList.length).to.equal(1);

      testDoneFn();
    });

  });

  it('api/add-sales (Valid, testing discountPresetId)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId,

        productList: [],

        serviceList: [
          {
            serviceId: longstandingService.id,
            salePrice: longstandingService.salePrice,
            vatPercentage: longstandingService.serviceBlueprint.defaultVat,
            assignedEmploymentId: employmentId
          }
        ],

        payment: {
          totalAmount: longstandingService.salePrice,
          vatAmount: (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100)),
          discountPresetId: validDiscountPresetId,
          discountType: 'percent',
          discountValue: 10,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          paidAmount: 1000,
          changeAmount: 1000 - (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddSalesApiSuccessResponse(body);
      longstandingServiceSaleId = body.salesId;
      testDoneFn();
    });

  });

  it('api/add-sales (Invalid, testing discountPresetId)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId,

        productList: [],

        serviceList: [
          {
            serviceId: longstandingService.id,
            salePrice: longstandingService.salePrice,
            vatPercentage: longstandingService.serviceBlueprint.defaultVat,
            assignedEmploymentId: employmentId
          }
        ],

        payment: {
          totalAmount: longstandingService.salePrice,
          vatAmount: (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100)),
          discountPresetId: validDiscountPresetId,
          discountType: 'percent',
          discountValue: 150,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          paidAmount: 1000,
          changeAmount: 1000 - (longstandingService.salePrice + (longstandingService.salePrice * (longstandingService.serviceBlueprint.defaultVat / 100))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: null,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal("DISCOUNT_CALCULATION_INVALID");
      testDoneFn();
    });

  });

  // Discount Preset - end

  // Region: Sell from warehouse - start

  it('api/get-aggregated-inventory-details (Warehouse inventory check)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(100);

      warehouseInventoryProductList = body.aggregatedProductList;
      warehouseInventoryMatchingProductBlueprintList = warehouseInventoryProductList.map(_product => _product.product.productBlueprint);
      testDoneFn();
    });

  });

  it('api/add-sales (Invalid warehouse sell, no module)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [
          {
            productId: warehouseInventoryProductList[0].productId,
            count: 2,
            salePrice: warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) + ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 + ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: warehouseId,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal("UNMET_MODULE");
      testDoneFn();
    });

  });

  it('api/admin-set-module-activation-status (Valid module)', testDoneFn => {

    callApi('api/admin-set-module-activation-status', {
      json: {
        apiKey: adminApiKey,
        organizationId: organizationId,
        moduleCode: "MOD_SELL_WAREHOUSE_PRODUCTS",
        paymentReference: "joi test",
        action: 'activate'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(response.statusCode).to.equal(200);
      testDoneFn();
    });

  });

  it('api/admin-get-module-list (Valid)', testDoneFn => {

    callApi('api/admin-get-module-list', {
      json: { apiKey: adminApiKey }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(response.statusCode).to.equal(200);
      testDoneFn();
    });

  });

  it('api/user-login', testDoneFn => {

    callApi('api/user-login', {
      json: {
        emailOrPhone: phone,
        password
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      apiKey = body.apiKey;
      testDoneFn();
    })

  });

  it('api/add-sales (Invalid warehouse)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [
          {
            productId: warehouseInventoryProductList[0].productId,
            count: 2,
            salePrice: warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) + ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 + ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: invalidWarehouseId,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal("WAREHOUSE_INVENTORY_INVALID");
      testDoneFn();
    });

  });

  it('api/add-sales (Valid)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [
          {
            productId: warehouseInventoryProductList[0].productId,
            count: 100,
            salePrice: warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) + ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 + ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: warehouseId,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddSalesApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Warehouse inventory check)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: warehouseDefaultInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);
      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(0);
      testDoneFn();
    });

  });

  it('api/add-sales (Invalid zero count)', testDoneFn => {

    callApi('api/add-sales', {
      json: {
        apiKey,

        outletId,
        customerId: null,

        productList: [
          {
            productId: warehouseInventoryProductList[0].productId,
            count: 2,
            salePrice: warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountPresetId: null,
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBillBeforeRounding: 0,
          roundedByAmount: 0,
          totalBilled: ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) + ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 + ((warehouseInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        },

        assistedByEmployeeId: null,
        productsSelectedFromWarehouseId: warehouseId,

        wasOfflineSale: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal("INSUFFICIENT_PRODUCT");
      testDoneFn();
    });

  });

  // Region: Sell from warehouse - end

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});