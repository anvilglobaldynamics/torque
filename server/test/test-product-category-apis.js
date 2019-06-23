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
  validateProductBlueprintSchema,
  validateAddProductBlueprintApiSuccessResponse,
  
  validateGenericApiFailureResponse,
  validateGenericApiSuccessResponse,

  validateProductCategorySchema,
  validateAddProductCategoryApiSuccessResponse,
  validateGetProductCategoryListApiSuccessResponse,
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

let productBlueprintList = null;
let productBlueprintOne = null;
let productBlueprintTwo = null;
let productBlueprintThree = null;

let productBlueprintToBeModified = null;
let invalidOrganizationId = generateInvalidId();
let invalidProductBlueprintId = generateInvalidId();

let productCategory = null;

describe.only('Product Category', _ => {

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
        colorCode: "FFFFFF"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddProductCategoryApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/add-product-category (Invalid, name too long)', testDoneFn => {

    callApi('api/add-product-category', {
      json: {
        apiKey,
        organizationId,
        name: "1st product category willingly tooo long tooooo long",
        colorCode: "FFFFFF"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      testDoneFn();
    })

  });

  it('api/add-product-category (Invalid, invalid colorCode)', testDoneFn => {

    callApi('api/add-product-category', {
      json: {
        apiKey,
        organizationId,
        name: "1st product category - 2",
        colorCode: "#FFFFFF"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      testDoneFn();
    })

  });

  it('api/add-product-category (Invalid, duplicate name)', testDoneFn => {

    callApi('api/add-product-category', {
      json: {
        apiKey,
        organizationId,
        name: "1st product category",
        colorCode: "FFFFFF"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      testDoneFn();
    })

  });

  it('api/get-product-category-list (No parameters)', testDoneFn => {

    callApi('api/get-product-category-list', {
      json: {
        apiKey,
        organizationId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetProductCategoryListApiSuccessResponse(body);

      body.productCategoryList.forEach(productCategory => {
        validateProductCategorySchema(productCategory);
      });

      expect(body.productCategoryList.length).to.equal(1);

      productCategory = body.productCategoryList[0];

      testDoneFn();
    });

  });

  it('api/edit-product-category (Valid)', testDoneFn => {

    callApi('api/edit-product-category', {
      json: {
        apiKey,
        productCategoryId: productCategory.id,
        name: "1st product category UPDATED",
        colorCode: "000000"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/add-product-category (Valid)', testDoneFn => {

    callApi('api/add-product-category', {
      json: {
        apiKey,
        organizationId,
        name: "2nd product category",
        colorCode: "FFFFFF"
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddProductCategoryApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/get-product-category-list (No parameters)', testDoneFn => {

    callApi('api/get-product-category-list', {
      json: {
        apiKey,
        organizationId,
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetProductCategoryListApiSuccessResponse(body);

      body.productCategoryList.forEach(productCategory => {
        validateProductCategorySchema(productCategory);
      });

      expect(body.productCategoryList.length).to.equal(2);

      testDoneFn();
    });

  });

  it('api/get-product-category-list (searchString)', testDoneFn => {

    callApi('api/get-product-category-list', {
      json: {
        apiKey,
        organizationId,
        searchString: '1st',
        searchBySearchString: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetProductCategoryListApiSuccessResponse(body);

      body.productCategoryList.forEach(productCategory => {
        validateProductCategorySchema(productCategory);
      });

      expect(body.productCategoryList.length).to.equal(1);
      expect(body.productCategoryList[0].colorCode).to.equal('000000');

      testDoneFn();
    });

  });

  it('api/get-product-category-list (searchString)', testDoneFn => {

    callApi('api/get-product-category-list', {
      json: {
        apiKey,
        organizationId,
        productCategoryIdList: [productCategory.id],
        searchBySearchString: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetProductCategoryListApiSuccessResponse(body);

      body.productCategoryList.forEach(productCategory => {
        validateProductCategorySchema(productCategory);
      });

      expect(body.productCategoryList.length).to.equal(1);

      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});