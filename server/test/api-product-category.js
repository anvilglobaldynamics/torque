let expect = require('chai').expect;

let { callApi } = require('./utils');
let {
  initializeServer,
  terminateServer,
  registerUser,
  loginUser,
  addOrganization,
  validateProductCategorySchema
} = require('./lib');

const email = `t2${(new Date).getTime()}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = 't2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

const orgEmail = `o2${(new Date).getTime()}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "My Address";
const orgPhone = 'o2' + String((new Date).getTime()).split('').reverse().slice(0, 11).join('');

let apiKey = null;
let organizationId = null;
let productCategoryList = null;
let productCategoryToBeModified = null;

describe('product-category', _ => {

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
            testDoneFn();
          })
        });
      });
    });
  });

  it('api/add-product-category (Valid)', testDoneFn => {

    callApi('api/add-product-category', {
      json: {
        apiKey,
        organizationId,

        parentProductCategoryId: null,
        name: "first product category",
        unit: "kg",
        defaultDiscountType: "percent",
        defaultDiscountValue: 10,
        defaultPurchasePrice: 99,
        defaultVat: 2,
        defaultSalePrice: 111,
        isReturnable: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it('api/get-product-category-list (Valid)', testDoneFn => {

    callApi('api/get-product-category-list', {
      json: {
        apiKey,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('productCategoryList').that.is.an('array');
      body.productCategoryList.forEach(productCategory => {
        validateProductCategorySchema(productCategory);
      });
      productCategoryList = body.productCategoryList;
      testDoneFn();
    });

  });

  it('api/edit-product-category (Valid)', testDoneFn => {

    callApi('api/edit-product-category', {
      json: {
        apiKey,
        productCategoryId: productCategoryList[0].id,

        parentProductCategoryId: null,
        name: "new product category name", // modification
        unit: "kg",
        defaultDiscountType: "percent",
        defaultDiscountValue: 10,
        defaultPurchasePrice: 99,
        defaultVat: 2,
        defaultSalePrice: 111,
        isReturnable: false // modification
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it('api/get-product-category-list (Valid)', testDoneFn => {

    callApi('api/get-product-category-list', {
      json: {
        apiKey,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('productCategoryList').that.is.an('array');

      expect(body.productCategoryList[0].name).to.equal("new product category name");
      expect(body.productCategoryList[0].isReturnable).to.equal(false);

      testDoneFn();
    });

  });

  it('api/delete-product-category (Valid)', testDoneFn => {

    callApi('api/delete-product-category', {
      json: {
        apiKey,
        warehouseId: warehouseToBeModified.id,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it('api/add-product-category (Invalid parentProductCategoryId)', testDoneFn => {

    callApi('api/add-product-category', {
      json: {
        apiKey,
        organizationId,

        parentProductCategoryId: 999,
        name: "first product category",
        unit: "kg",
        defaultDiscountType: "percent",
        defaultDiscountValue: 10,
        defaultPurchasePrice: 99,
        defaultVat: 2,
        defaultSalePrice: 111,
        isReturnable: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('PARENT_PRODUCT_CATEGORY_INVALID');
      testDoneFn();
    })

  });

  it('api/edit-product-category (Invalid parentProductCategoryId)', testDoneFn => {

    callApi('api/edit-product-category', {
      json: {
        apiKey,
        productCategoryId: productCategoryList[0].id,

        parentProductCategoryId: 999,
        name: "new product category name", // modification
        unit: "kg",
        defaultDiscountType: "percent",
        defaultDiscountValue: 10,
        defaultPurchasePrice: 99,
        defaultVat: 2,
        defaultSalePrice: 111,
        isReturnable: false // modification
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('PARENT_PRODUCT_CATEGORY_INVALID');
      testDoneFn();
    })

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});