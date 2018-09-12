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
  validateProductCategorySchema,
  validateAddProductCategoryApiSuccessResponse,
  validateGenericApiFailureResponse,
  validateGetProductCategoryListApiSuccessResponse,
  validateGenericApiSuccessResponse
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
let productCategoryOne = null;
let productCategoryTwo = null;
let productCategoryThree = null;

let productCategoryToBeModified = null;
let invalidOrganizationId = generateInvalidId();
let invalidParentProductCategoryId = generateInvalidId();
let invalidProductCategoryId = generateInvalidId();

describe('Product Category', _ => {

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
            testDoneFn();
          })
        });
      });
    });
  });

  // ADD-GET

  it('api/add-product-category (Valid)', testDoneFn => {

    callApi('api/add-product-category', {
      json: {
        apiKey,
        organizationId,
        name: "1st product category",
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
      validateAddProductCategoryApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/add-product-category (Valid)', testDoneFn => {

    callApi('api/add-product-category', {
      json: {
        apiKey,
        organizationId,
        name: "2nd product category",
        unit: "kg",
        defaultDiscountType: "fixed",
        defaultDiscountValue: 11,
        defaultPurchasePrice: 99,
        defaultVat: 2,
        defaultSalePrice: 111,
        isReturnable: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddProductCategoryApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/add-product-category (Invalid organization)', testDoneFn => {

    callApi('api/add-product-category', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId,
        name: "invalid product category",
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
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('ORGANIZATION_INVALID');
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
      validateGetProductCategoryListApiSuccessResponse(body);

      body.productCategoryList.forEach(productCategory => {
        validateProductCategorySchema(productCategory);
      });

      body.productCategoryList.reverse();
      productCategoryOne = body.productCategoryList[0];

      testDoneFn();
    });

  });

  it('api/get-product-category-list (Invalid Organization)', testDoneFn => {

    callApi('api/get-product-category-list', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('ORGANIZATION_INVALID');
      testDoneFn();
    });

  });

  it('api/get-product-category-list (Valid)', testDoneFn => {

    callApi('api/get-product-category-list', {
      json: {
        apiKey,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetProductCategoryListApiSuccessResponse(body);
      body.productCategoryList.forEach(productCategory => {
        validateProductCategorySchema(productCategory);
      });

      body.productCategoryList.reverse();
      productCategoryOne = body.productCategoryList[0];
      productCategoryTwo = body.productCategoryList[1];
      productCategoryThree = body.productCategoryList[2];

      testDoneFn();
    });

  });

  // EDIT

  it('api/edit-product-category (Valid)', testDoneFn => {

    callApi('api/edit-product-category', {
      json: {
        apiKey,
        productCategoryId: productCategoryOne.id,
        name: "new 1st product category name", // modification
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
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/edit-product-category (Invalid productCategoryId)', testDoneFn => {

    callApi('api/edit-product-category', {
      json: {
        apiKey,
        productCategoryId: invalidProductCategoryId,

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
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('PRODUCT_CATEGORY_INVALID');
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
      validateGetProductCategoryListApiSuccessResponse(body);
      body.productCategoryList.forEach(productCategory => {
        validateProductCategorySchema(productCategory);
      });

      body.productCategoryList.reverse();
      productCategoryList = body.productCategoryList;
      expect(body.productCategoryList[0].name).to.equal("new 1st product category name");
      expect(body.productCategoryList[0].isReturnable).to.equal(false);

      testDoneFn();
    });

  });

  // DELETE

  it.skip('api/delete-product-category (Invalid productCategoryId)', testDoneFn => {

    callApi('api/delete-product-category', {
      json: {
        apiKey,
        productCategoryId: invalidProductCategoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('PRODUCT_CATEGORY_INVALID');
      testDoneFn();
    })

  });

  it.skip('api/delete-product-category (Valid)', testDoneFn => {

    callApi('api/delete-product-category', {
      json: {
        apiKey,
        productCategoryId: productCategoryTwo.id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it.skip('api/get-product-category-list (Valid deletion check)', testDoneFn => {

    callApi('api/get-product-category-list', {
      json: {
        apiKey,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetProductCategoryListApiSuccessResponse(body);
      body.productCategoryList.forEach(productCategory => {
        validateProductCategorySchema(productCategory);
      });

      let oldList = productCategoryList;
      productCategoryList = body.productCategoryList;
      expect(productCategoryList.length + 1).to.equal(oldList.length);

      testDoneFn();
    });

  });

  it.skip('api/delete-product-category (Invalid parent deletetion)', testDoneFn => {

    callApi('api/delete-product-category', {
      json: {
        apiKey,
        productCategoryId: productCategoryOne.id
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('PRODUCT_CATEGORY_NOT_CHILDLESS');
      testDoneFn();
    })

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});