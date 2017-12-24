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
  validateProductCategorySchema
} = require('./lib');

const prefix = 's';

const email = `${rnd(prefix)}@gmail.com`;
const password = "123545678";
const fullName = "Test User";
const phone = rnd(prefix, 11);

const orgEmail = 'o' + `${rnd(prefix)}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "My Address";
const orgPhone = 'o' + rnd(prefix, 11);

let apiKey = null;
let organizationId = null;
let productCategoryList = null;
let productCategoryToBeModified = null;
let invalidParentProductCategoryId = generateInvalidId();

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

  it('api/add-product-category (Valid child)', testDoneFn => {

    callApi('api/add-product-category', {
      json: {
        apiKey,
        organizationId,

        parentProductCategoryId: productCategoryList[0].id,
        name: "second product category",
        unit: "kg",
        defaultDiscountType: "fixed",
        defaultDiscountValue: 101,
        defaultPurchasePrice: 50,
        defaultVat: 5,
        defaultSalePrice: 300,
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

  it('api/get-product-category-list (Valid modification check)', testDoneFn => {

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

      expect(body.productCategoryList[0].name).to.equal("new product category name");
      expect(body.productCategoryList[0].isReturnable).to.equal(false);

      testDoneFn();
    });

  });

  it('api/delete-product-category (Valid)', testDoneFn => {

    callApi('api/delete-product-category', {
      json: {
        apiKey,
        productCategoryId: productCategoryList[productCategoryList.length - 1].id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  it('api/get-product-category-list (Valid deletion check)', testDoneFn => {

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

      expect(body.productCategoryList[productCategoryList.length - 1].isDeleted).to.equal(true);
      testDoneFn();
    });

  });

  it('api/add-product-category (Invalid parentProductCategoryId)', testDoneFn => {

    callApi('api/add-product-category', {
      json: {
        apiKey,
        organizationId,

        parentProductCategoryId: invalidParentProductCategoryId,
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
        productCategoryId: productCategoryList[productCategoryList.length - 1].id,

        parentProductCategoryId: invalidParentProductCategoryId,
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

  it('api/delete-product-category (Invalid parent deletetion)', testDoneFn => {

    callApi('api/delete-product-category', {
      json: {
        apiKey,
        productCategoryId: productCategoryList[0].id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(true);
      expect(body).to.have.property('error');
      expect(body.error.code).to.equal('PRODUCT_CATEGORY_NOT_CHILDLESS');
      testDoneFn();
    })

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});