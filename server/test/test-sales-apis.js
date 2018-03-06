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
  addProductCategory,
  addProductToInventory,
  addCustomer,
  getCustomer,
  getOutlet,
  validateInventorySchema,
  validateProductCategorySchema,
  validateProductSchema,
  validateSalesSchema
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

const productCategoryName = "test product category";

const customerFullName = "A Test Customer";
const customerPhone = 'c' + rnd(prefix, 11);
const openingBalance = '500';

let apiKey = null;
let organizationId = null;
let outletId = null;
let productCategoryId = null;
let customerId = null;
let salesId = null;

let outletInventoryProductList = null;
let outletInventoryMatchingProductList = null;
let outletInventoryMatchingProductCategoryList = null;

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

let fromDate = new Date();
fromDate.setDate(fromDate.getDate() - 1);
fromDate = fromDate.getTime();

describe('sales', _ => {

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
                      getCustomer({
                        apiKey, customerId
                      }, (data) => {
                        customerData = data.customer;
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

  it('api/get-aggregated-inventory-details (Inventory check)', testDoneFn => {

    callApi('api/get-aggregated-inventory-details', {
      json: {
        apiKey,
        inventoryId: outletDefaultInventoryId
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

      expect(body.productList[0]).to.have.property('count').that.equals(100);
      expect(body.productList[0]).to.have.property('productId');

      outletInventoryProductList = body.productList;
      outletInventoryMatchingProductList = body.matchingProductList;
      outletInventoryMatchingProductCategoryList = body.matchingProductCategoryList;

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
            discountType: outletInventoryMatchingProductCategoryList[0].defaultDiscountType,
            discountValue: outletInventoryMatchingProductCategoryList[0].defaultDiscountValue,
            salePrice: outletInventoryMatchingProductCategoryList[0].defaultSalePrice
          }
        ],

        payment: {
          totalAmount: (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100)),
          discountType: outletInventoryMatchingProductCategoryList[0].defaultDiscountType,
          discountValue: outletInventoryMatchingProductCategoryList[0].defaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBilled: (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100))),
          previousCustomerBalance: null,
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100))))
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('OUTLET_INVALID');

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
            discountType: outletInventoryMatchingProductCategoryList[0].defaultDiscountType,
            discountValue: outletInventoryMatchingProductCategoryList[0].defaultDiscountValue,
            salePrice: outletInventoryMatchingProductCategoryList[0].defaultSalePrice
          }
        ],

        payment: {
          totalAmount: (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100)),
          discountType: outletInventoryMatchingProductCategoryList[0].defaultDiscountType,
          discountValue: outletInventoryMatchingProductCategoryList[0].defaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBilled: (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100))),
          previousCustomerBalance: null,
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100))))
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('PRODUCT_INVALID');

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
            discountType: outletInventoryMatchingProductCategoryList[0].defaultDiscountType,
            discountValue: outletInventoryMatchingProductCategoryList[0].defaultDiscountValue,
            salePrice: outletInventoryMatchingProductCategoryList[0].defaultSalePrice
          }
        ],

        payment: {
          totalAmount: (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100)),
          discountType: outletInventoryMatchingProductCategoryList[0].defaultDiscountType,
          discountValue: outletInventoryMatchingProductCategoryList[0].defaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBilled: (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100))),
          previousCustomerBalance: null,
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100))))
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('salesId');
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
            discountType: outletInventoryMatchingProductCategoryList[0].defaultDiscountType,
            discountValue: outletInventoryMatchingProductCategoryList[0].defaultDiscountValue,
            salePrice: outletInventoryMatchingProductCategoryList[0].defaultSalePrice
          }
        ],

        payment: {
          totalAmount: (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100)),
          discountType: outletInventoryMatchingProductCategoryList[0].defaultDiscountType,
          discountValue: outletInventoryMatchingProductCategoryList[0].defaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBilled: (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100))),
          previousCustomerBalance: customerData.balance,
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100))))
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('CUSTOMER_INVALID');

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
            discountType: outletInventoryMatchingProductCategoryList[0].defaultDiscountType,
            discountValue: outletInventoryMatchingProductCategoryList[0].defaultDiscountValue,
            salePrice: outletInventoryMatchingProductCategoryList[0].defaultSalePrice
          }
        ],

        payment: {
          totalAmount: (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2),
          vatAmount: ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100)),
          discountType: outletInventoryMatchingProductCategoryList[0].defaultDiscountType,
          discountValue: outletInventoryMatchingProductCategoryList[0].defaultDiscountValue,
          discountedAmount: ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)),
          serviceChargeAmount: 0,
          totalBilled: (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100))),
          previousCustomerBalance: customerData.balance,
          paidAmount: 300,
          changeAmount: (300 - (outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2 - ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (outletInventoryMatchingProductCategoryList[0].defaultDiscountValue / 100)) + ((outletInventoryMatchingProductCategoryList[0].defaultSalePrice * 2) * (5 / 100))))
        }
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      expect(body).to.have.property('salesId');

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

      expect(body.productList[0]).to.have.property('count').that.equals(96);

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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('SALES_INVALID');

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('sales');

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('salesList');

      body.salesList.forEach(sales => {
        validateSalesSchema(sales);
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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('salesList');

      body.salesList.forEach(sales => {
        validateSalesSchema(sales);
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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals("OUTLET_INVALID");

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('salesList');

      body.salesList.forEach(sales => {
        validateSalesSchema(sales);
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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals("CUSTOMER_INVALID");

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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals("CUSTOMER_INVALID");

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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals("OUTLET_INVALID");

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
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('salesList');

      body.salesList.forEach(sales => {
        validateSalesSchema(sales);
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
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error).to.have.property('code').that.equals("ORGANIZATION_INVALID");

      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});