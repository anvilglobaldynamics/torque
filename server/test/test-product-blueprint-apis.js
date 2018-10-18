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
  validateGenericApiSuccessResponse,
  validateBulkImportProductCategoriesApiSuccessResponse
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

  it('api/add-product-category (Invalid copy name)', testDoneFn => {

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
      validateGenericApiFailureResponse(body);
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

  it('api/get-product-category-list (Valid searchString)', testDoneFn => {

    callApi('api/get-product-category-list', {
      json: {
        apiKey,
        organizationId,
        searchString: '1ST'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetProductCategoryListApiSuccessResponse(body);

      body.productCategoryList.forEach(productCategory => {
        validateProductCategorySchema(productCategory);
      });

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

  it('api/add-product-category (Invalid fixed defaultDiscountValue)', testDoneFn => {

    callApi('api/add-product-category', {
      json: {
        apiKey,
        organizationId,
        name: "1st product category",
        unit: "kg",
        defaultDiscountType: "fixed",
        defaultDiscountValue: 114,
        defaultPurchasePrice: 99,
        defaultVat: 2,
        defaultSalePrice: 111,
        isReturnable: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('DISCOUNT_VALUE_INVALID');
      testDoneFn();
    })

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

  it('api/edit-product-category (Invalid copy name)', testDoneFn => {

    callApi('api/edit-product-category', {
      json: {
        apiKey,
        productCategoryId: productCategoryOne.id,
        name: "2nd product category", // copy modification
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

  it('api/delete-product-category (Confirm that API is disabled)', testDoneFn => {

    callApi('api/delete-product-category', {
      json: {
        apiKey,
        productCategoryId: invalidProductCategoryId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('API_DISABLED');
      testDoneFn();
    })

  });

  it('api/bulk-import-product-categories (Valid and unique)', testDoneFn => {

    callApi('api/bulk-import-product-categories', {
      json: {
        apiKey,
        organizationId,
        rowList: [
          ["Should Be Unique 1", "pc", 300, 500, 10, "percent", 100, "Yes"],
          ["Should Be Unique 2", "haali", 10, 10, 10, "fixed", 0, "No"]
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateBulkImportProductCategoriesApiSuccessResponse(body);
      expect(body.ignoredRowList).to.deep.equal([]);
      expect(body.successfulCount).to.equal(2);
      testDoneFn();
    })

  });

  it('api/bulk-import-product-categories (Valid but not unique)', testDoneFn => {

    callApi('api/bulk-import-product-categories', {
      json: {
        apiKey,
        organizationId,
        rowList: [
          ["Should Be Unique 3", "pc", 300, 500, 10, "percent", 100, "Yes"],
          ["Should Be Unique 2", "haali", 10, 10, 10, "fixed", 0, "No"]
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateBulkImportProductCategoriesApiSuccessResponse(body);
      expect(body.ignoredRowList).to.deep.equal([
        {
          "reason": "name-duplication",
          "rowNumber": 2
        }
      ]);
      expect(body.successfulCount).to.equal(1);
      testDoneFn();
    })

  });

  it('api/bulk-import-product-categories (Invalid)', testDoneFn => {

    callApi('api/bulk-import-product-categories', {
      json: {
        apiKey,
        organizationId,
        rowList: [
          ["Should Be Unique 4", "pc", 300, 500, 10, "percent", 100, "FFYes"],
          ["Should Be Unique 5", "haali", 10, 10, 10, "fixed", 0, "No"]
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('MODIFIED_VALIDATION_ERROR');
      expect(body.error.message).to.equal('Cell #8 must be one of [Yes, No]');
      expect(body.error.rowNumber).to.equal(1);
      expect(body.error.cellNumber).to.equal(8);
      testDoneFn();
    })

  });

  it('api/bulk-import-product-categories (Invalid)', testDoneFn => {

    callApi('api/bulk-import-product-categories', {
      json: {
        apiKey,
        organizationId,
        rowList: [
          ["Should Be Unique 5", "pc", 300, 500, 10, "percent", 100, "Yes"],
          ["", "haali", 10, 10, 10, "fixed", 0, "No"]
        ]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).to.equal('MODIFIED_VALIDATION_ERROR');
      expect(body.error.message).to.equal('Cell #1 is not allowed to be empty');
      expect(body.error.rowNumber).to.equal(2);
      expect(body.error.cellNumber).to.equal(1);
      testDoneFn();
    })

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});