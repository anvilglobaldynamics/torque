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

  validateGenericApiFailureResponse,
  validateAddServiceBlueprintApiSuccessResponse,
  validateGetServiceBlueprintListApiSuccessResponse,
  validateServiceBlueprintSchema
} = require('./lib');

const prefix = 's';

const password = "123545678";
const fullName = "Test User";
const phone = rnd(prefix, 11);

const orgEmail = 'o' + `${rnd(prefix)}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "Test Organization Address";
const orgPhone = 'o' + rnd(prefix, 11);

let apiKey = null;
let organizationId = null;

let invalidOrganizationId = generateInvalidId();
let invalidProductBlueprintId = generateInvalidId();

describe.only('Service Blueprint', _ => {

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

  // Add

  it('api/add-service-blueprint (Invalid defaultVat)', testDoneFn => {

    callApi('api/add-service-blueprint', {
      json: {
        apiKey,
        organizationId,
        
        name: "1st service blueprint",
      
        defaultVat: 110,
        defaultSalePrice: 250,
        
        isLongstanding: false,
        serviceDuration: null,
      
        isEmployeeAssignable: false,
        isCustomerRequired: false,
        isRefundable: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('VAT_VALUE_INVALID');
      testDoneFn();
    })

  });

  it('api/add-service-blueprint (Invalid organizationId)', testDoneFn => {

    callApi('api/add-service-blueprint', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId,
        
        name: "1st service blueprint",
      
        defaultVat: 10,
        defaultSalePrice: 250,
        
        isLongstanding: false,
        serviceDuration: null,
      
        isEmployeeAssignable: false,
        isCustomerRequired: false,
        isRefundable: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('ORGANIZATION_INVALID');
      testDoneFn();
    })

  });

  it('api/add-service-blueprint (Valid basic service)', testDoneFn => {

    callApi('api/add-service-blueprint', {
      json: {
        apiKey,
        organizationId,
        
        name: "1st service blueprint",
      
        defaultVat: 2,
        defaultSalePrice: 250,
        
        isLongstanding: false,
        serviceDuration: null,
      
        isEmployeeAssignable: false,
        isCustomerRequired: false,
        isRefundable: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddServiceBlueprintApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/add-service-blueprint (Valid service)', testDoneFn => {

    callApi('api/add-service-blueprint', {
      json: {
        apiKey,
        organizationId,
        
        name: "2nd service blueprint",
      
        defaultVat: 2,
        defaultSalePrice: 250,
        
        isLongstanding: false,
        serviceDuration: null,
      
        isEmployeeAssignable: true,
        isCustomerRequired: true,
        isRefundable: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddServiceBlueprintApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/add-service-blueprint (Invalid Longstanding service setup)', testDoneFn => {

    callApi('api/add-service-blueprint', {
      json: {
        apiKey,
        organizationId,
        
        name: "3rd service blueprint",
      
        defaultVat: 2,
        defaultSalePrice: 250,
        
        isLongstanding: true,
        serviceDuration: null,
      
        isEmployeeAssignable: true,
        isCustomerRequired: true,
        isRefundable: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('LONGSTANDING_SETUP_INVALID');
      testDoneFn();
    })

  });

  it('api/add-service-blueprint (Invalid Longstanding service setup)', testDoneFn => {

    callApi('api/add-service-blueprint', {
      json: {
        apiKey,
        organizationId,
        
        name: "3rd service blueprint",
      
        defaultVat: 2,
        defaultSalePrice: 250,
        
        isLongstanding: false,
        serviceDuration: {
          months: 1,
          days: 7
        },
      
        isEmployeeAssignable: true,
        isCustomerRequired: true,
        isRefundable: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('LONGSTANDING_SETUP_INVALID');
      testDoneFn();
    })

  });

  it('api/add-service-blueprint (Valid Longstanding service)', testDoneFn => {

    callApi('api/add-service-blueprint', {
      json: {
        apiKey,
        organizationId,
        
        name: "3rd service blueprint",
      
        defaultVat: 2,
        defaultSalePrice: 250,
        
        isLongstanding: true,
        serviceDuration: {
          months: 1,
          days: 7
        },
      
        isEmployeeAssignable: true,
        isCustomerRequired: true,
        isRefundable: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddServiceBlueprintApiSuccessResponse(body);
      testDoneFn();
    })

  });

  // Get

  it('api/get-service-blueprint-list (Invalid organizationId)', testDoneFn => {

    callApi('api/get-service-blueprint-list', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId,
        searchString: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('ORGANIZATION_INVALID');
      testDoneFn();
    });

  });

  it('api/get-service-blueprint-list (Valid)', testDoneFn => {

    callApi('api/get-service-blueprint-list', {
      json: {
        apiKey,
        organizationId,
        searchString: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetServiceBlueprintListApiSuccessResponse(body);

      body.serviceBlueprintList.forEach(serviceBlueprint => {
        validateServiceBlueprintSchema(serviceBlueprint);
      });

      testDoneFn();
    });

  });

  it('api/get-service-blueprint-list (Invalid searchString)', testDoneFn => {

    callApi('api/get-service-blueprint-list', {
      json: {
        apiKey,
        organizationId,
        searchString: 99
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('VALIDATION_ERROR');
      testDoneFn();
    });

  });

  it('api/get-service-blueprint-list (Valid searchString)', testDoneFn => {

    callApi('api/get-service-blueprint-list', {
      json: {
        apiKey,
        organizationId,
        searchString: '2nd'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetServiceBlueprintListApiSuccessResponse(body);
      expect(body.serviceBlueprintList.length).equal(1);

      body.serviceBlueprintList.forEach(serviceBlueprint => {
        validateServiceBlueprintSchema(serviceBlueprint);
      });

      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});