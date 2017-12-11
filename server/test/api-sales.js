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

let outletInventoryProductList = null;
let outletInventoryMatchingProductList = null;
let outletInventoryMatchingProductCategoryList = null;

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

  it('api/save-sales (Valid, No Customer)', testDoneFn => {

    callApi('api/save-sales', {
      json: {
        apiKey,

        salesId: null,

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

      expect(body.productList[0]).to.have.property('count').that.equals(98);

      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});