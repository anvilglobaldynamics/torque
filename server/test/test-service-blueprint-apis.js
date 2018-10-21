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

  validateGenericApiFailureResponse,
  validateGenericApiSuccessResponse,
  validateAddServiceBlueprintApiSuccessResponse,
  validateGetServiceBlueprintListApiSuccessResponse,
  validateServiceBlueprintSchema,
  validateGetActiveServiceListApiSuccessResponse,
  validateServiceSchema
} = require('./lib');

const prefix = 's';

const password = "123545678";
const fullName = "Test User";
const phone = rnd(prefix, 11);

const orgEmail = 'o' + `${rnd(prefix)}@gmail.com`;
const orgName = "Test Organization";
const orgBusinessAddress = "Test Organization Address";
const orgPhone = 'o' + rnd(prefix, 11);
const outletName = "Test Outlet";
const outletContactPersonName = "Test Outlet contact person";
const outletTwoName = "2nd Test Outlet";

let apiKey = null;
let organizationId = null;
let outletId = null;
let outletTwoId = null;

let invalidOrganizationId = generateInvalidId();
let invalidProductBlueprintId = generateInvalidId();
let invalidOutletId = generateInvalidId(); 
let invalidServiceBlueprintId = generateInvalidId(); 

let serviceBlueprintToBeEdited = null;
let serviceBlueprintToBeActivated = null;

describe.only('Service', _ => {

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
              physicalAddress: orgBusinessAddress,
              phone: orgPhone,
              contactPersonName: outletContactPersonName
            }, (data) => {
              outletId = data.outletId;
              addOutlet({
                apiKey,
                organizationId,
                name: outletTwoName,
                physicalAddress: orgBusinessAddress,
                phone: orgPhone,
                contactPersonName: outletContactPersonName
              }, (data) => {
                outletTwoId = data.outletId;
                testDoneFn();
              });
            });
          });
        });
      });
    });
  });

  // Add Service Blueprint

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
        isRefundable: false,
        avtivateInAllOutlets: false
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
        isRefundable: false,
        avtivateInAllOutlets: false
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
        isRefundable: false,
        avtivateInAllOutlets: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddServiceBlueprintApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/add-service-blueprint (Invalid copy name)', testDoneFn => {

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
        isRefundable: false,
        avtivateInAllOutlets: true
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('DUPLICATE_organizationId+name');
      testDoneFn();
    })

  });

  it('api/add-service-blueprint (Valid service)', testDoneFn => {

    callApi('api/add-service-blueprint', {
      json: {
        apiKey,
        organizationId,
        
        name: "2nd service blueprint",
      
        defaultVat: 10,
        defaultSalePrice: 250,
        
        isLongstanding: false,
        serviceDuration: null,
      
        isEmployeeAssignable: true,
        isCustomerRequired: true,
        isRefundable: true,
        avtivateInAllOutlets: false
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
        isRefundable: true,
        avtivateInAllOutlets: true
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
        isRefundable: true,
        avtivateInAllOutlets: true
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
        defaultSalePrice: 8600,
        
        isLongstanding: true,
        serviceDuration: {
          months: 1,
          days: 7
        },
      
        isEmployeeAssignable: true,
        isCustomerRequired: true,
        isRefundable: true,
        avtivateInAllOutlets: false
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateAddServiceBlueprintApiSuccessResponse(body);
      testDoneFn();
    })

  });

  // Get Service Blueprint

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
        searchString: '1st'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetServiceBlueprintListApiSuccessResponse(body);
      expect(body.serviceBlueprintList.length).equal(1);

      body.serviceBlueprintList.forEach(serviceBlueprint => {
        validateServiceBlueprintSchema(serviceBlueprint);
      });

      serviceBlueprintToBeActivated = body.serviceBlueprintList[0];
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

      serviceBlueprintToBeEdited = body.serviceBlueprintList[0];
      testDoneFn();
    });

  });

  // Edit Service Blueprint

  it('api/edit-service-blueprint (Invalid serviceBlueprintId)', testDoneFn => {

    callApi('api/edit-service-blueprint', {
      json: {
        apiKey,
        serviceBlueprintId: invalidProductBlueprintId,

        name: serviceBlueprintToBeEdited.name,
        defaultVat: serviceBlueprintToBeEdited.defaultVat,
        defaultSalePrice: serviceBlueprintToBeEdited.defaultSalePrice,

        isLongstanding: serviceBlueprintToBeEdited.isLongstanding,
        serviceDuration: serviceBlueprintToBeEdited.serviceDuration,

        isEmployeeAssignable: serviceBlueprintToBeEdited.isEmployeeAssignable,
        isCustomerRequired: serviceBlueprintToBeEdited.isCustomerRequired,
        isRefundable: serviceBlueprintToBeEdited.isRefundable
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('PRODUCT_BLUEPRINT_INVALID');
      testDoneFn();
    })

  });

  it('api/edit-service-blueprint (Invalid defaultVat)', testDoneFn => {

    callApi('api/edit-service-blueprint', {
      json: {
        apiKey,
        serviceBlueprintId: serviceBlueprintToBeEdited.id,

        name: serviceBlueprintToBeEdited.name,
        defaultVat: 200,
        defaultSalePrice: serviceBlueprintToBeEdited.defaultSalePrice,

        isLongstanding: serviceBlueprintToBeEdited.isLongstanding,
        serviceDuration: serviceBlueprintToBeEdited.serviceDuration,

        isEmployeeAssignable: serviceBlueprintToBeEdited.isEmployeeAssignable,
        isCustomerRequired: serviceBlueprintToBeEdited.isCustomerRequired,
        isRefundable: serviceBlueprintToBeEdited.isRefundable
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('VAT_VALUE_INVALID');
      testDoneFn();
    })

  });

  it('api/edit-service-blueprint (Invalid Longstanding service setup)', testDoneFn => {

    callApi('api/edit-service-blueprint', {
      json: {
        apiKey,
        serviceBlueprintId: serviceBlueprintToBeEdited.id,

        name: serviceBlueprintToBeEdited.name,
        defaultVat: serviceBlueprintToBeEdited.defaultVat,
        defaultSalePrice: serviceBlueprintToBeEdited.defaultSalePrice,

        isLongstanding: true,
        serviceDuration: serviceBlueprintToBeEdited.serviceDuration,

        isEmployeeAssignable: serviceBlueprintToBeEdited.isEmployeeAssignable,
        isCustomerRequired: serviceBlueprintToBeEdited.isCustomerRequired,
        isRefundable: serviceBlueprintToBeEdited.isRefundable
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('LONGSTANDING_SETUP_INVALID');
      testDoneFn();
    })

  });

  it('api/edit-service-blueprint (Invalid Longstanding service setup)', testDoneFn => {

    callApi('api/edit-service-blueprint', {
      json: {
        apiKey,
        serviceBlueprintId: serviceBlueprintToBeEdited.id,

        name: serviceBlueprintToBeEdited.name,
        defaultVat: serviceBlueprintToBeEdited.defaultVat,
        defaultSalePrice: serviceBlueprintToBeEdited.defaultSalePrice,

        isLongstanding: false,
        serviceDuration: {
          months: 1,
          days: 7
        },

        isEmployeeAssignable: serviceBlueprintToBeEdited.isEmployeeAssignable,
        isCustomerRequired: serviceBlueprintToBeEdited.isCustomerRequired,
        isRefundable: serviceBlueprintToBeEdited.isRefundable
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('LONGSTANDING_SETUP_INVALID');
      testDoneFn();
    })

  });

  it('api/edit-service-blueprint (Invalid copy name)', testDoneFn => {

    callApi('api/edit-service-blueprint', {
      json: {
        apiKey,
        serviceBlueprintId: serviceBlueprintToBeEdited.id,

        name: '3rd service blueprint',
        defaultVat: serviceBlueprintToBeEdited.defaultVat,
        defaultSalePrice: serviceBlueprintToBeEdited.defaultSalePrice,

        isLongstanding: serviceBlueprintToBeEdited.isLongstanding,
        serviceDuration: serviceBlueprintToBeEdited.serviceDuration,

        isEmployeeAssignable: serviceBlueprintToBeEdited.isEmployeeAssignable,
        isCustomerRequired: serviceBlueprintToBeEdited.isCustomerRequired,
        isRefundable: serviceBlueprintToBeEdited.isRefundable
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('DUPLICATE_organizationId+name');
      testDoneFn();
    })

  });

  it('api/edit-service-blueprint (Valid)', testDoneFn => {

    callApi('api/edit-service-blueprint', {
      json: {
        apiKey,
        serviceBlueprintId: serviceBlueprintToBeEdited.id,

        name: 'new 2nd service blueprint name', // modification
        defaultVat: serviceBlueprintToBeEdited.defaultVat,
        defaultSalePrice: serviceBlueprintToBeEdited.defaultSalePrice,

        isLongstanding: serviceBlueprintToBeEdited.isLongstanding,
        serviceDuration: serviceBlueprintToBeEdited.serviceDuration,

        isEmployeeAssignable: serviceBlueprintToBeEdited.isEmployeeAssignable,
        isCustomerRequired: serviceBlueprintToBeEdited.isCustomerRequired,
        isRefundable: serviceBlueprintToBeEdited.isRefundable
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    })

  });

  it('api/get-service-blueprint-list (Valid edit check)', testDoneFn => {

    callApi('api/get-service-blueprint-list', {
      json: {
        apiKey,
        organizationId,
        searchString: 'new 2nd service blueprint name'
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetServiceBlueprintListApiSuccessResponse(body);
      body.serviceBlueprintList.forEach(serviceBlueprint => {
        validateServiceBlueprintSchema(serviceBlueprint);
      });

      expect(body.serviceBlueprintList[0].name).equal('new 2nd service blueprint name');
      testDoneFn();
    });

  });

  // Get Service 

  it('api/get-active-service-list (Invalid outletId)', testDoneFn => {

    callApi('api/get-active-service-list', {
      json: {
        apiKey,
        outletId: invalidOutletId,
        searchString: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('OUTLET_INVALID');
      testDoneFn();
    });

  });

  it('api/get-active-service-list (Valid)', testDoneFn => {

    callApi('api/get-active-service-list', {
      json: {
        apiKey,
        outletId,
        searchString: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetActiveServiceListApiSuccessResponse(body);
      body.serviceList.forEach(service => {
        validateServiceSchema(service);
      });

      expect(body.serviceList.length).equal(1);
      testDoneFn();
    });

  });

  // Activate Service

  it('api/activate-service-list-in-outlet-list (Invalid organizationId)', testDoneFn => {

    callApi('api/activate-service-list-in-outlet-list', {
      json: {
        apiKey,
        organizationId: invalidOrganizationId,

        activateAllServices: true,
        serviceBlueprintList: [],
      
        activateInAllOutlets: true,
        outletIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('ORGANIZATION_INVALID');
      testDoneFn();
    });

  });

  it('api/activate-service-list-in-outlet-list (Invalid serviceBlueprintList)', testDoneFn => {

    callApi('api/activate-service-list-in-outlet-list', {
      json: {
        apiKey,
        organizationId,

        activateAllServices: false,
        serviceBlueprintList: [
          {
            something: "something"
          }
        ],
      
        activateInAllOutlets: true,
        outletIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('VALIDATION_ERROR');
      testDoneFn();
    });

  });

  it('api/activate-service-list-in-outlet-list (Invalid serviceBlueprintList)', testDoneFn => {

    callApi('api/activate-service-list-in-outlet-list', {
      json: {
        apiKey,
        organizationId,

        activateAllServices: false,
        serviceBlueprintList: [
          {
            serviceBlueprintId: invalidServiceBlueprintId,
            salePrice: 999
          }
        ],
      
        activateInAllOutlets: true,
        outletIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('SERVICE_BLUEPRINT_INVALID');
      testDoneFn();
    });

  });

  it('api/activate-service-list-in-outlet-list (Invalid outletIdList)', testDoneFn => {

    callApi('api/activate-service-list-in-outlet-list', {
      json: {
        apiKey,
        organizationId,

        activateAllServices: true,
        serviceBlueprintList: [],
      
        activateInAllOutlets: false,
        outletIdList: [invalidOutletId]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('OUTLET_INVALID');
      testDoneFn();
    });

  });

  it('api/activate-service-list-in-outlet-list (Invalid predeterminer setup)', testDoneFn => {

    callApi('api/activate-service-list-in-outlet-list', {
      json: {
        apiKey,
        organizationId,

        activateAllServices: false,
        serviceBlueprintList: [],
      
        activateInAllOutlets: false,
        outletIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('PREDETERMINER_SETUP_INVALID');
      testDoneFn();
    });

  });

  it('api/activate-service-list-in-outlet-list (Invalid predeterminer setup)', testDoneFn => {

    callApi('api/activate-service-list-in-outlet-list', {
      json: {
        apiKey,
        organizationId,

        activateAllServices: true,
        serviceBlueprintList: [],
      
        activateInAllOutlets: true,
        outletIdList: [1]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('PREDETERMINER_SETUP_INVALID');
      testDoneFn();
    });

  });

  it('api/activate-service-list-in-outlet-list (Invalid predeterminer setup)', testDoneFn => {

    callApi('api/activate-service-list-in-outlet-list', {
      json: {
        apiKey,
        organizationId,

        activateAllServices: true,
        serviceBlueprintList: [
          {
            serviceBlueprintId: 1,
            salePrice: 100
          }
        ],
      
        activateInAllOutlets: true,
        outletIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiFailureResponse(body);
      expect(body.error.code).equal('PREDETERMINER_SETUP_INVALID');
      testDoneFn();
    });

  });

  it('api/activate-service-list-in-outlet-list (Valid)', testDoneFn => {

    callApi('api/activate-service-list-in-outlet-list', {
      json: {
        apiKey,
        organizationId,

        activateAllServices: false,
        serviceBlueprintList: [
          {
            serviceBlueprintId: serviceBlueprintToBeActivated.id,
            salePrice: serviceBlueprintToBeActivated.defaultSalePrice
          }
        ],
      
        activateInAllOutlets: false,
        outletIdList: [outletId]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/get-active-service-list (Valid activation check)', testDoneFn => {

    callApi('api/get-active-service-list', {
      json: {
        apiKey,
        outletId,
        searchString: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetActiveServiceListApiSuccessResponse(body);
      body.serviceList.forEach(service => {
        validateServiceSchema(service);
      });

      expect(body.serviceList.length).equal(1);
      testDoneFn();
    });

  });

  it('api/get-active-service-list (Valid activation check)', testDoneFn => {

    callApi('api/get-active-service-list', {
      json: {
        apiKey,
        outletId: outletTwoId,
        searchString: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetActiveServiceListApiSuccessResponse(body);
      body.serviceList.forEach(service => {
        validateServiceSchema(service);
      });

      expect(body.serviceList.length).equal(1);
      testDoneFn();
    });

  });

  it('api/activate-service-list-in-outlet-list (Valid all service in outlet)', testDoneFn => {

    callApi('api/activate-service-list-in-outlet-list', {
      json: {
        apiKey,
        organizationId,

        activateAllServices: true,
        serviceBlueprintList: [],
      
        activateInAllOutlets: false,
        outletIdList: [outletTwoId]
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/get-active-service-list (Valid all service activation check)', testDoneFn => {

    callApi('api/get-active-service-list', {
      json: {
        apiKey,
        outletId: outletTwoId,
        searchString: ''
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);

      validateGetActiveServiceListApiSuccessResponse(body);
      body.serviceList.forEach(service => {
        validateServiceSchema(service);
      });

      expect(body.serviceList.length).equal(3);
      testDoneFn();
    });

  });

  it('api/activate-service-list-in-outlet-list (Valid service blueprint in all outlet)', testDoneFn => {

    callApi('api/activate-service-list-in-outlet-list', {
      json: {
        apiKey,
        organizationId,

        activateAllServices: false,
        serviceBlueprintList: [
          {
            serviceBlueprintId: serviceBlueprintToBeActivated.id,
            salePrice: serviceBlueprintToBeActivated.defaultSalePrice
          }
        ],
      
        activateInAllOutlets: true,
        outletIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('api/activate-service-list-in-outlet-list (Valid all in all)', testDoneFn => {

    callApi('api/activate-service-list-in-outlet-list', {
      json: {
        apiKey,
        organizationId,

        activateAllServices: true,
        serviceBlueprintList: [],
      
        activateInAllOutlets: true,
        outletIdList: []
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      validateGenericApiSuccessResponse(body);
      testDoneFn();
    });

  });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});