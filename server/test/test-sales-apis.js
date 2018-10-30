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
  addProductBlueprint,
  addProductToInventory,
  addCustomer,
  getCustomer,
  getOutlet,
  addServiceBlueprint,
  validateInventorySchema,
  validateProductBlueprintSchema,
  validateProductSchema,
  validateGenericApiFailureResponse,
  validateGenericApiSuccessResponse,
  validateGetAggregatedInventoryDetailsApiSuccessResponse,
  validateAddSalesApiSuccessResponse,
  validateGetSalesApiSuccessResponse,
  validateGetSalesListApiSuccessResponse,
  validateAddSalesReturnApiSuccessResponse,
  validateSalesSchema,
  validateSalesSchemaWhenListObj,

  validateGetActiveServiceListApiSuccessResponse,
  validateServiceSchema,

  validateGetCustomerApiSuccessResponse,
  validateCustomerSchema
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
let organizationId = null;
let outletId = null;
let productBlueprintId = null;
let customerId = null;
let salesId = null;
let salesData = null;

let outletInventoryProductList = null;
let outletInventoryMatchingProductList = null;
let outletInventoryMatchingProductBlueprintList = null;

let outletDefaultInventoryId = null;
let outletReturnedInventoryId = null;
let outletDamagedInventoryId = null;

let customerData = null;

let productToBeTransferredId = null;

let invalidOrganizationId = generateInvalidId();
let invalidOutletId = generateInvalidId();
let invalidProductId = generateInvalidId();
let invalidCustomerId = generateInvalidId();
let invalidSalesId = generateInvalidId();
let invalidEmployeeId = generateInvalidId();

let fromDate = new Date();
fromDate.setDate(fromDate.getDate() - 1);
fromDate = fromDate.getTime();

let customerRef1 = null;

let basicServiceBlueprintId = null;
let basicService = null;
let basicServiceSaleId = null;
let customerAndEmployeeServiceBlueprintId = null;
let customerAndEmployeeService = null;
let longstandingServiceBlueprintId = null;
let longstandingService = null;
let variedServiceSaleId = null;

describe.only('Sales', _ => {

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
                addProductBlueprint({
                  apiKey,
                  organizationId,
                  name: productBlueprintName,
                  unit: "box",
                  defaultDiscountType: "percent",
                  defaultDiscountValue: 10,
                  defaultPurchasePrice: 99,
                  defaultVat: 3,
                  defaultSalePrice: 112,
                  isReturnable: true
                }, (data) => {
                  productBlueprintId = data.productBlueprintId;
                  addProductToInventory({
                    apiKey,
                    inventoryId: outletDefaultInventoryId,
                    productList: [
                      { productBlueprintId, purchasePrice: 99, salePrice: 200, count: 100 }
                    ]
                  }, (data) => {
                    addCustomer({
                      apiKey,
                      organizationId,
                      fullName: customerFullName,
                      phone: customerPhone
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
            discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
            discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
          discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        }
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
          discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
          discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        }
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
            discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
            discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
          discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        }
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
            discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
            discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountType: 'something',
          discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        }
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
            discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
            discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
          discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddSalesApiSuccessResponse(body);
      testDoneFn();
    });

  });

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
            discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
            discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {}
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
            discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
            discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
          discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 0,
          changeAmount: (0 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        }
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
            discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
            discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
          discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('CUSTOMER_INVALID');
      testDoneFn();
    });

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
            discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
            discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
          discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 1300,
          changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)))),
          shouldSaveChangeInAccount: true,
          paymentMethod: 'cash'
        }
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
      testDoneFn();
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
            discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
            discountValue: outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue,
            salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
            vatPercentage: 5,
          }
        ],

        serviceList: [],

        payment: {
          totalAmount: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100)),
          discountType: outletInventoryMatchingProductBlueprintList[0].defaultDiscountType,
          discountValue: 0,
          discountedAmount: ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBilled: (outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductBlueprintList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[0].defaultSalePrice * 2) * (5 / 100))),
          paidAmount: 30, // out of total billed 212.799999999
          changeAmount: 0,
          shouldSaveChangeInAccount: true,
          paymentMethod: 'cash'
        }
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
          paidAmount: 200,
          changeAmount: 47.20,
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
      expect(diff).to.equal(47.2)
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
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBilled: basicService.salePrice + (basicService.salePrice * (basicService.serviceBlueprint.defaultVat / 100)),
          paidAmount: 1000,
          changeAmount: (1000 - (basicService.salePrice + (basicService.salePrice * (basicService.serviceBlueprint.defaultVat / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        }
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
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBilled: basicService.salePrice + (basicService.salePrice * (basicService.serviceBlueprint.defaultVat / 100)),
          paidAmount: 1000,
          changeAmount: (1000 - (basicService.salePrice + (basicService.salePrice * (basicService.serviceBlueprint.defaultVat / 100)))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        }
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

  // customerAndEmployeeService
  // longstandingService

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
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBilled: (customerAndEmployeeService.salePrice + (customerAndEmployeeService.salePrice * (customerAndEmployeeService.serviceBlueprint.defaultVat / 100))),
          paidAmount: 1000,
          changeAmount: 1000 - (customerAndEmployeeService.salePrice + (customerAndEmployeeService.salePrice * (customerAndEmployeeService.serviceBlueprint.defaultVat / 100))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        }
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
          discountType: 'percent',
          discountValue: 0,
          discountedAmount: 0,
          serviceChargeAmount: 0,
          totalBilled: (customerAndEmployeeService.salePrice + (customerAndEmployeeService.salePrice * (customerAndEmployeeService.serviceBlueprint.defaultVat / 100))),
          paidAmount: 1000,
          changeAmount: 1000 - (customerAndEmployeeService.salePrice + (customerAndEmployeeService.salePrice * (customerAndEmployeeService.serviceBlueprint.defaultVat / 100))),
          shouldSaveChangeInAccount: false,
          paymentMethod: 'cash'
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('ASSIGNED_EMPLOYEE_INVALID');
      testDoneFn();
    });

  });

  // Service Sales - end

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});