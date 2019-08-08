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
  getAggregatedInventoryDetails,
  addSales,
  getSales,
  validateInventorySchema,
  validateProductBlueprintSchema,
  validateProductSchema,
  validateSalesSchema,
  validateGenericApiFailureResponse,
  validateAddSalesReturnApiSuccessResponse,
  validateGetAggregatedInventoryDetailsApiSuccessResponse,
  validateGetSalesReturnApiSuccessResponse,
  validateGetSalesReturnListApiSuccessResponse,
  validateSalesReturnSchema,
  validateSalesReturnSchemaWhenListObj,
  validateGenericApiSuccessResponse,
  validateGetSalesApiSuccessResponse
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

const customerFullName = "A Test Customer";
const customerPhone = 'o2' + rnd(prefix, 11);
const openingBalance = '500';

let apiKey = null;
let organizationId = null;
let outletId = null;
let returnableProductBlueprintId = null;
let nonReturnableProductBlueprintId = null;
let customerId = null;
let salesId = null;
let sales2Id = null;
let sales2SalesNumber = null;
let salesReturnId = null;

let outletInventoryProductList = null;
let outletInventoryMatchingProductList = null;
let outletInventoryMatchingProductBlueprintList = null;

let outletDefaultInventoryId = null;
let outletReturnedInventoryId = null;
let outletDamagedInventoryId = null;

let customerData = null;
let salesData = null;
let sales2Data = null;

let productToBeTransferredId = null;

let invlidOrganizationId = generateInvalidId();
let invalidOutletId = generateInvalidId();
let invalidCustomerId = generateInvalidId();
let invalidSalesReturnId = generateInvalidId();
let invalidSalesId = generateInvalidId();
let invalidProductId = generateInvalidId();

let fromDate = new Date();
fromDate.setDate(fromDate.getDate() - 1);
fromDate = fromDate.getTime();

let placeholderDefaultDiscountType = 'percent';
let placeholderDefaultDiscountValue = 5;

describe('Sales Return', _ => {

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
                  returnableProductBlueprintId = data.productBlueprintId;
                  addProductBlueprint({
                    apiKey,
                    organizationId,
                    name: "non returnable product blueprint",
                    unit: "box",
                    identifierCode: '',
                    defaultPurchasePrice: 99,
                    defaultVat: 3,
                    defaultSalePrice: 111,
                    productCategoryIdList: [],
                    isReturnable: false
                  }, (data) => {
                    nonReturnableProductBlueprintId = data.productBlueprintId;
                    addProductToInventory({
                      apiKey,
                      inventoryId: outletDefaultInventoryId,
                      productList: [
                        { productBlueprintId: returnableProductBlueprintId, count: 100 }
                      ],
                      vendorId: null
                    }, (data) => {
                      addProductToInventory({
                        apiKey,
                        inventoryId: outletDefaultInventoryId,
                        productList: [
                          { productBlueprintId: nonReturnableProductBlueprintId, count: 200 }
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
                            getAggregatedInventoryDetails({
                              apiKey,
                              inventoryId: outletDefaultInventoryId
                            }, (data) => {
                              outletInventoryProductList = data.aggregatedProductList;
                              outletInventoryMatchingProductBlueprintList = outletInventoryProductList.map(_product => _product.product.productBlueprint);
                              addSales({
                                apiKey,
                                outletId,
                                customerId,
                                productList: [
                                  {
                                    productId: outletInventoryProductList[0].productId,
                                    count: 2,
                                    salePrice: outletInventoryMatchingProductBlueprintList[0].defaultSalePrice,
                                    vatPercentage: 5
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
                              }, (data) => {
                                salesId = data.salesId;
                                addSales({
                                  apiKey,
                                  outletId,
                                  customerId,
                                  productList: [
                                    {
                                      productId: outletInventoryProductList[1].productId,
                                      count: 2,
                                      salePrice: outletInventoryMatchingProductBlueprintList[1].defaultSalePrice,
                                      vatPercentage: 5
                                    }
                                  ],
                                  serviceList: [],
                                  payment: {
                                    totalAmount: (outletInventoryMatchingProductBlueprintList[1].defaultSalePrice * 2),
                                    vatAmount: ((outletInventoryMatchingProductBlueprintList[1].defaultSalePrice * 2) * (5 / 100)),
                                    discountPresetId: null,
                                    discountType: placeholderDefaultDiscountType,
                                    discountValue: placeholderDefaultDiscountValue,
                                    discountedAmount: ((outletInventoryMatchingProductBlueprintList[1].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)),
                                    serviceChargeAmount: 0,
                                    totalBillBeforeRounding: 0,
                                    roundedByAmount: 0,
                                    totalBilled: (outletInventoryMatchingProductBlueprintList[1].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[1].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[1].defaultSalePrice * 2) * (5 / 100))),
                                    paidAmount: 300,
                                    changeAmount: (300 - (outletInventoryMatchingProductBlueprintList[1].defaultSalePrice * 2 - ((outletInventoryMatchingProductBlueprintList[1].defaultSalePrice * 2) * (placeholderDefaultDiscountValue / 100)) + ((outletInventoryMatchingProductBlueprintList[1].defaultSalePrice * 2) * (5 / 100)))),
                                    shouldSaveChangeInAccount: false,
                                    paymentMethod: 'cash'
                                  },

                                  assistedByEmployeeId: null,
                                  productsSelectedFromWarehouseId: null,

                                  wasOfflineSale: false
                                }, (data) => {
                                  sales2Id = data.salesId;
                                  getSales({
                                    apiKey, salesId
                                  }, (data) => {
                                    salesData = data.sales;
                                    getSales({
                                      apiKey, salesId: sales2Id
                                    }, (data) => {
                                      sales2Data = data.sales;
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
      sales2SalesNumber = body.sales.salesNumber;
      testDoneFn();
    });

  });

  it('api/add-sales-return (Invalid salesId)', testDoneFn => {

    callApi('api/add-sales-return', {
      json: {
        apiKey,
        salesId: invalidSalesId,
        returnedProductList: [
          {
            productId: salesData.productList[0].productId,
            count: salesData.productList[0].count
          }
        ],
        creditedAmount: 100, // TODO: use data from salesData.payment
        shouldSaveReturnableInChangeWallet: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('SALES_INVALID');
      testDoneFn();
    });

  });

  it('api/add-sales-return (Invalid returnedProductList)', testDoneFn => {

    callApi('api/add-sales-return', {
      json: {
        apiKey,
        salesId,
        returnedProductList: [
          {
            productId: invalidProductId,
            count: 10
          }
        ],
        creditedAmount: 100, // TODO: use data from salesData.payment
        shouldSaveReturnableInChangeWallet: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('PRODUCT_INVALID');
      testDoneFn();
    });

  });

  it('api/add-sales-return (Valid)', testDoneFn => {

    callApi('api/add-sales-return', {
      json: {
        apiKey,
        salesId,
        returnedProductList: [
          {
            productId: salesData.productList[0].productId,
            count: salesData.productList[0].count
          }
        ],
        creditedAmount: 100, // TODO: use data from salesData.payment
        shouldSaveReturnableInChangeWallet: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddSalesReturnApiSuccessResponse(body);
      salesReturnId = body.salesReturnId;
      testDoneFn();
    });

  });

  it('api/add-sales-return (Invalid non returnable)', testDoneFn => {

    callApi('api/add-sales-return', {
      json: {
        apiKey,
        salesId: sales2Id,
        returnedProductList: [
          {
            productId: sales2Data.productList[0].productId,
            count: sales2Data.productList[0].count
          }
        ],
        creditedAmount: 300, // TODO: use data from salesData.payment
        shouldSaveReturnableInChangeWallet: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('PRODUCT_BLUEPRINT_NON_RETURNABLE');
      testDoneFn();
    });

  });

  it('api/discard-sales (Valid)', testDoneFn => {

    callApi('api/discard-sales', {
      json: {
        apiKey,
        salesId: sales2Id,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/add-sales-return (Invalid. already discarded)', testDoneFn => {

    callApi('api/add-sales-return', {
      json: {
        apiKey,
        salesId: sales2Id,
        returnedProductList: [
          {
            productId: sales2Data.productList[0].productId,
            count: sales2Data.productList[0].count
          }
        ],
        creditedAmount: 300, // TODO: use data from salesData.payment
        shouldSaveReturnableInChangeWallet: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('SALES_RETURN_FOR_DISCARDED_SALE_IS_INVALID');
      testDoneFn();
    });

  });

  it('api/get-aggregated-inventory-details (Valid return check)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: outletReturnedInventoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetAggregatedInventoryDetailsApiSuccessResponse(body);

      expect(body.aggregatedProductList[0]).to.have.property('count').that.equals(2);
      testDoneFn();
    });

  });

  it('api/get-sales-return (Valid)', testDoneFn => {

    callApi('api/get-sales-return', {
      json: {
        apiKey,
        salesReturnId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetSalesReturnApiSuccessResponse(body);
      validateSalesReturnSchema(body.salesReturn);
      testDoneFn();
    });

  });

  it('api/get-sales-return (Invalid)', testDoneFn => {

    callApi('api/get-sales-return', {
      json: {
        apiKey,
        salesReturnId: invalidSalesReturnId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('SALES_RETURN_INVALID');
      testDoneFn();
    });

  });

  it('api/get-sales-return-list (Valid only organization Id)', testDoneFn => {

    callApi('api/get-sales-return-list', {
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
      validateGetSalesReturnListApiSuccessResponse(body);
      body.salesReturnList.forEach(salesReturn => {
        validateSalesReturnSchemaWhenListObj(salesReturn);
      });
      testDoneFn();
    });

  });

  it('api/get-sales-return-list (Valid with organizationId and outletId)', testDoneFn => {

    callApi('api/get-sales-return-list', {
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
      validateGetSalesReturnListApiSuccessResponse(body);
      body.salesReturnList.forEach(salesReturn => {
        validateSalesReturnSchemaWhenListObj(salesReturn);
      });
      testDoneFn();
    });

  });

  it('api/get-sales-return-list (Valid with organizationId and Invalid outletId)', testDoneFn => {

    callApi('api/get-sales-return-list', {
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

  it('api/get-sales-return-list (Valid with organizationId and customerId)', testDoneFn => {

    callApi('api/get-sales-return-list', {
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
      validateGetSalesReturnListApiSuccessResponse(body);
      body.salesReturnList.forEach(salesReturn => {
        validateSalesReturnSchemaWhenListObj(salesReturn);
      });
      testDoneFn();
    });

  });

  it('api/get-sales-return-list (Valid with searchString (salesNumber))', testDoneFn => {

    callApi('api/get-sales-return-list', {
      json: {
        apiKey,
        organizationId,
        outletId: null,
        customerId: null,

        shouldFilterByOutlet: false,
        shouldFilterByCustomer: false,

        searchString: String(sales2SalesNumber),

        fromDate,
        toDate: (new Date()).getTime(),
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetSalesReturnListApiSuccessResponse(body);
      body.salesReturnList.forEach(salesReturn => {
        validateSalesReturnSchemaWhenListObj(salesReturn);
      });
      expect(body.salesReturnList.length).to.equal(1);
      expect(body.salesReturnList[0].id).to.equal(salesReturnId);
      testDoneFn();
    });

  });

  it('api/get-sales-return-list (Valid with organizationId and Invalid customerId)', testDoneFn => {

    callApi('api/get-sales-return-list', {
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

  it('api/get-sales-return-list (Valid with organizationId and Invalid customerId is null)', testDoneFn => {

    callApi('api/get-sales-return-list', {
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

  it('api/get-sales-return-list (Valid with organizationId and Invalid outletId is null)', testDoneFn => {

    callApi('api/get-sales-return-list', {
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

  it('api/get-sales-return-list (Valid with organizationId, outletId and customerId)', testDoneFn => {

    callApi('api/get-sales-return-list', {
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
      validateGetSalesReturnListApiSuccessResponse(body);
      body.salesReturnList.forEach(salesReturn => {
        validateSalesReturnSchemaWhenListObj(salesReturn);
      });
      testDoneFn();
    });

  });

  it('api/get-sales-return-list (Invalid organizationId, valid outletId and customerId)', testDoneFn => {

    callApi('api/get-sales-return-list', {
      json: {
        apiKey,
        organizationId: invlidOrganizationId,
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

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});