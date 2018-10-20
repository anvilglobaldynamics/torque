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
  validateGetProductBlueprintListApiSuccessResponse,
  validateGenericApiSuccessResponse,
  validateBulkImportProductBlueprintsApiSuccessResponse
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

describe.only('Product Blueprint', _ => {

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

  it('api/add-product-blueprint (Valid)', testDoneFn => {

    callApi('api/add-product-blueprint', {
      json: {
        apiKey,
        organizationId,
        name: "1st product blueprint",
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
      validateAddProductBlueprintApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/add-product-blueprint (Invalid copy name)', testDoneFn => {

    callApi('api/add-product-blueprint', {
      json: {
        apiKey,
        organizationId,
        name: "1st product blueprint",
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

  it('api/add-product-blueprint (Valid)', testDoneFn => {

    callApi('api/add-product-blueprint', {
      json: {
        apiKey,
        organizationId,
        name: "2nd product blueprint",
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
      validateAddProductBlueprintApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/add-product-blueprint (Invalid organization)', testDoneFn => {

    callApi('api/add-product-blueprint', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId,
        name: "invalid product blueprint",
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

  it('api/get-product-blueprint-list (Valid searchString)', testDoneFn => {

    callApi('api/get-product-blueprint-list', {
      json: {
        apiKey,
        organizationId,
        searchString: '1ST'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetProductBlueprintListApiSuccessResponse(body);

      body.productBlueprintList.forEach(productBlueprint => {
        validateProductBlueprintSchema(productBlueprint);
      });

      testDoneFn();
    });

  });

  it('api/get-product-blueprint-list (Valid)', testDoneFn => {

    callApi('api/get-product-blueprint-list', {
      json: {
        apiKey,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetProductBlueprintListApiSuccessResponse(body);

      body.productBlueprintList.forEach(productBlueprint => {
        validateProductBlueprintSchema(productBlueprint);
      });

      body.productBlueprintList.reverse();
      productBlueprintOne = body.productBlueprintList[0];

      testDoneFn();
    });

  });

  it('api/get-product-blueprint-list (Invalid Organization)', testDoneFn => {

    callApi('api/get-product-blueprint-list', {
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

  it('api/get-product-blueprint-list (Valid)', testDoneFn => {

    callApi('api/get-product-blueprint-list', {
      json: {
        apiKey,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetProductBlueprintListApiSuccessResponse(body);
      body.productBlueprintList.forEach(productBlueprint => {
        validateProductBlueprintSchema(productBlueprint);
      });

      body.productBlueprintList.reverse();
      productBlueprintOne = body.productBlueprintList[0];
      productBlueprintTwo = body.productBlueprintList[1];
      productBlueprintThree = body.productBlueprintList[2];

      testDoneFn();
    });

  });

  it('api/add-product-blueprint (Invalid fixed defaultDiscountValue)', testDoneFn => {

    callApi('api/add-product-blueprint', {
      json: {
        apiKey,
        organizationId,
        name: "1st product blueprint",
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

  it('api/edit-product-blueprint (Valid)', testDoneFn => {

    callApi('api/edit-product-blueprint', {
      json: {
        apiKey,
        productBlueprintId: productBlueprintOne.id,
        name: "new 1st product blueprint name", // modification
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

  it('api/edit-product-blueprint (Invalid copy name)', testDoneFn => {

    callApi('api/edit-product-blueprint', {
      json: {
        apiKey,
        productBlueprintId: productBlueprintOne.id,
        name: "2nd product blueprint", // copy modification
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

  it('api/edit-product-blueprint (Invalid productBlueprintId)', testDoneFn => {

    callApi('api/edit-product-blueprint', {
      json: {
        apiKey,
        productBlueprintId: invalidProductBlueprintId,

        name: "new product blueprint name", // modification
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
      expect(body.error.code).equal('PRODUCT_BLUEPRINT_INVALID');
      testDoneFn();
    })

  });

  it('api/get-product-blueprint-list (Valid modification check)', testDoneFn => {

    callApi('api/get-product-blueprint-list', {
      json: {
        apiKey,
        organizationId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGetProductBlueprintListApiSuccessResponse(body);
      body.productBlueprintList.forEach(productBlueprint => {
        validateProductBlueprintSchema(productBlueprint);
      });

      body.productBlueprintList.reverse();
      productBlueprintList = body.productBlueprintList;
      expect(body.productBlueprintList[0].name).to.equal("new 1st product blueprint name");
      expect(body.productBlueprintList[0].isReturnable).to.equal(false);

      testDoneFn();
    });

  });

  // DELETE

  it('api/delete-product-blueprint (Confirm that API is disabled)', testDoneFn => {

    callApi('api/delete-product-blueprint', {
      json: {
        apiKey,
        productBlueprintId: invalidProductBlueprintId
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('API_DISABLED');
      testDoneFn();
    })

  });

  it('api/bulk-import-product-blueprints (Valid and unique)', testDoneFn => {

    callApi('api/bulk-import-product-blueprints', {
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
      validateBulkImportProductBlueprintsApiSuccessResponse(body);
      expect(body.ignoredRowList).to.deep.equal([]);
      expect(body.successfulCount).to.equal(2);
      testDoneFn();
    })

  });

  it('api/bulk-import-product-blueprints (Valid but not unique)', testDoneFn => {

    callApi('api/bulk-import-product-blueprints', {
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
      validateBulkImportProductBlueprintsApiSuccessResponse(body);
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

  it('api/bulk-import-product-blueprints (Invalid)', testDoneFn => {

    callApi('api/bulk-import-product-blueprints', {
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

  it('api/bulk-import-product-blueprints (Invalid)', testDoneFn => {

    callApi('api/bulk-import-product-blueprints', {
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