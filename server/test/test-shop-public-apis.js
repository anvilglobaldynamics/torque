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
  addProductBlueprint,
  addProductToInventory,
  addCustomer,
  getCustomer,
  getOutlet,
  addServiceBlueprint,
  validateInventorySchema,
  validateProductBlueprintSchema,
  validateProductSchema,
  validateGenericApiFailureResponse,
  validateGenericApiSuccessResponse,
  validateGetAggregatedInventoryDetailsApiSuccessResponse,
  validateAddSalesApiSuccessResponse,
  validateGetSalesApiSuccessResponse,
  validateGetSalesListApiSuccessResponse,
  validateAddSalesReturnApiSuccessResponse,
  validateSalesSchema,
  validateSalesSchemaWhenListObj,

  validateGetActiveServiceListApiSuccessResponse,
  validateServiceSchema,

  validateGetServiceMembershipListApiSuccessResponse,
  validateServiceMembershipSchemaWhenListObj,

  validateGetCustomerApiSuccessResponse,
  validateCustomerSchema,

  getActiveServiceList,
  addSales,
  getAsyncDatabase,
  validateShopLocateNearbyOutletsApiSuccessResponse,
  validateOutletReturnedByShopLocateNearbyOutletsApi,
  validateShopGetOutletDetailsApiSuccessResponse
} = require('./lib');

let { promisifyApiCall } = require('./lib');

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

const productBlueprintName = "test product blueprint";

const customerFullName = "A Test Customer";
const customerPhone = 'c' + rnd(prefix, 11);
const openingBalance = '500';

let apiKey = null;


describe('Shop : Geolocation', _ => {

  it('START', testDoneFn => {
    initializeServer(_ => {
      registerUser({
        password, fullName, phone
      }, (data) => {
        loginUser({
          emailOrPhone: phone, password
        }, (data) => {
          apiKey = data.apiKey;
          testDoneFn();
        });
      });
    });
  });

  // Geometric & Outlet Details Test - start

  let suite1Data = {
    organization1Id: null,
    outlet1Id: null,
    outlet2Id: null,
    serviceBlueprint1Id: null,
    serviceBlueprint2Id: null,
  }

  let backupData = null;

  it('Database: Backup & Delete', testDoneFn => {
    Promise.resolve()
      .then(() => getAsyncDatabase().engine.find(getAsyncDatabase().cacheOutletGeolocation.name, {}))
      .then((_data) => {
        backupData = _data;
        return getAsyncDatabase().engine.deleteMany(getAsyncDatabase().cacheOutletGeolocation.name, {});
      })
      .catch(ex => console.error(ex))
      .then(testDoneFn())
  });

  it('Preparing for geometric test', testDoneFn => {

    Promise.resolve()
      .then(() => promisifyApiCall({}, addOrganization, {
        apiKey,
        name: orgName,
        primaryBusinessAddress: orgBusinessAddress,
        phone: orgPhone,
        email: orgEmail
      }))
      .then(({ organizationId }) => suite1Data.organization1Id = organizationId)

      .then(() => promisifyApiCall({}, addOutlet, {
        apiKey,
        organizationId: suite1Data.organization1Id,
        name: outletName,
        physicalAddress: outletPhysicalAddress,
        phone: outletPhone,
        contactPersonName: outletContactPersonName,
        location: { lat: 4, lng: 5 },
        categoryCode: 'CAT_GENERAL'
      }))
      .then(({ outletId }) => suite1Data.outlet1Id = outletId)

      .then(() => promisifyApiCall({}, addOutlet, {
        apiKey,
        organizationId: suite1Data.organization1Id,
        name: outletName,
        physicalAddress: outletPhysicalAddress,
        phone: outletPhone,
        contactPersonName: outletContactPersonName,
        location: { lat: 5, lng: 6 },
        categoryCode: 'CAT_GYM'
      }))
      .then(({ outletId }) => suite1Data.outlet2Id = outletId)

      // longstanding ServiceBlueprint1
      .then(() => promisifyApiCall({}, addServiceBlueprint, {
        apiKey,
        organizationId: suite1Data.organization1Id,
        name: "Long 1",
        defaultVat: 2,
        defaultSalePrice: 250,
        isLongstanding: true,
        serviceDuration: {
          months: 1,
          days: 7
        },
        isEmployeeAssignable: true,
        isCustomerRequired: true,
        isRefundable: false,
        avtivateInAllOutlets: true
      }))
      .then(({ serviceBlueprintId }) => suite1Data.serviceBlueprint1Id = serviceBlueprintId)

      // longstanding ServiceBlueprint2
      .then(() => promisifyApiCall({}, addServiceBlueprint, {
        apiKey,
        organizationId: suite1Data.organization1Id,
        name: "Long 2",
        defaultVat: 2,
        defaultSalePrice: 250,
        isLongstanding: true,
        serviceDuration: {
          months: 1,
          days: 7
        },
        isEmployeeAssignable: true,
        isCustomerRequired: true,
        isRefundable: false,
        avtivateInAllOutlets: true
      }))
      .then(({ serviceBlueprintId }) => suite1Data.serviceBlueprint2Id = serviceBlueprintId)

      // ProductBlueprint1
      .then(() => promisifyApiCall({}, addProductBlueprint, {
        apiKey,
        organizationId: suite1Data.organization1Id,
        name: "Poor Shoes",
        unit: "box",
        identifierCode: '',
        defaultPurchasePrice: 99,
        defaultVat: 3,
        defaultSalePrice: 112,
        isReturnable: true
      }))
      .then(({ productBlueprintId }) => suite1Data.productBlueprint1Id = productBlueprintId)

      // ProductBlueprint2
      .then(() => promisifyApiCall({}, addProductBlueprint, {
        apiKey,
        organizationId: suite1Data.organization1Id,
        name: "Poor Clothes",
        unit: "box",
        identifierCode: '',
        defaultPurchasePrice: 99,
        defaultVat: 3,
        defaultSalePrice: 112,
        isReturnable: true
      }))
      .then(({ productBlueprintId }) => suite1Data.productBlueprint2Id = productBlueprintId)

      // ProductBlueprint3
      .then(() => promisifyApiCall({}, addProductBlueprint, {
        apiKey,
        organizationId: suite1Data.organization1Id,
        name: "Rich Clothes",
        unit: "box",
        identifierCode: '',
        defaultPurchasePrice: 99,
        defaultVat: 3,
        defaultSalePrice: 112,
        isReturnable: true
      }))
      .then(({ productBlueprintId }) => suite1Data.productBlueprint3Id = productBlueprintId)

      // outlet1DefaultInventory
      .then(() => promisifyApiCall({}, getOutlet, {
        apiKey, outletId: suite1Data.outlet1Id
      }))
      .then(({ defaultInventory }) => suite1Data.outlet1DefaultInventoryId = defaultInventory.id)

      // Product
      .then(() => promisifyApiCall({}, addProductToInventory, {
        apiKey,
        inventoryId:  suite1Data.outlet1DefaultInventoryId,
        productList: [
          { productBlueprintId: suite1Data.productBlueprint3Id, count: 100 }
        ]
      }))
      .then((data) => 'pass')

      .catch(ex => console.error(ex))

      .then(() => {
        // console.log('final test object', suite1Data);
        testDoneFn();
      });

  });

  it('api/shop-locate-nearby-outlets (Geometry)', testDoneFn => {

    callApi('api/shop-locate-nearby-outlets', {
      json: {
        northEast: {
          lat: 1,
          lng: 1,
        },
        southWest: {
          lat: 12,
          lng: 20,
        },
        categoryCode: null,
        searchString: ''
      }
    }, (err, response, body) => {
      // console.dir(body, { depth: null });
      expect(response.statusCode).to.equal(200);
      validateShopLocateNearbyOutletsApiSuccessResponse(body);
      body.outletList.forEach(outlet => {
        validateOutletReturnedByShopLocateNearbyOutletsApi(outlet);
      });
      expect(body.outletList.length).to.equal(2);
      testDoneFn();
    });

  });

  it('api/shop-locate-nearby-outlets (Geometry)', testDoneFn => {

    callApi('api/shop-locate-nearby-outlets', {
      json: {
        northEast: {
          lat: 1,
          lng: 1,
        },
        southWest: {
          lat: 5,
          lng: 5,
        },
        categoryCode: null,
        searchString: ''
      }
    }, (err, response, body) => {
      // console.dir(body, { depth: null });
      expect(response.statusCode).to.equal(200);
      validateShopLocateNearbyOutletsApiSuccessResponse(body);
      body.outletList.forEach(outlet => {
        validateOutletReturnedByShopLocateNearbyOutletsApi(outlet);
      });
      expect(body.outletList.length).to.equal(1);
      testDoneFn();
    });

  });

  it('api/shop-locate-nearby-outlets (Geometry)', testDoneFn => {

    callApi('api/shop-locate-nearby-outlets', {
      json: {
        northEast: {
          lat: 1,
          lng: 1,
        },
        southWest: {
          lat: 2,
          lng: 2,
        },
        categoryCode: null,
        searchString: ''
      }
    }, (err, response, body) => {
      // console.dir(body, { depth: null });
      expect(response.statusCode).to.equal(200);
      validateShopLocateNearbyOutletsApiSuccessResponse(body);
      body.outletList.forEach(outlet => {
        validateOutletReturnedByShopLocateNearbyOutletsApi(outlet);
      });
      expect(body.outletList.length).to.equal(0);
      testDoneFn();
    });

  });

  it('api/shop-locate-nearby-outlets (Geometry + categoryCode)', testDoneFn => {

    callApi('api/shop-locate-nearby-outlets', {
      json: {
        northEast: {
          lat: 1,
          lng: 1,
        },
        southWest: {
          lat: 12,
          lng: 20,
        },
        categoryCode: 'CAT_GYM',
        searchString: ''
      }
    }, (err, response, body) => {
      // console.dir(body, { depth: null });
      expect(response.statusCode).to.equal(200);
      validateShopLocateNearbyOutletsApiSuccessResponse(body);
      body.outletList.forEach(outlet => {
        validateOutletReturnedByShopLocateNearbyOutletsApi(outlet);
      });
      expect(body.outletList.length).to.equal(1);
      testDoneFn();
    });

  });

  it('api/shop-locate-nearby-outlets (Geometry + categoryCode (invalid))', testDoneFn => {

    callApi('api/shop-locate-nearby-outlets', {
      json: {
        northEast: {
          lat: 1,
          lng: 1,
        },
        southWest: {
          lat: 12,
          lng: 20,
        },
        categoryCode: 'CAT_XXX',
        searchString: ''
      }
    }, (err, response, body) => {
      // console.dir(body, { depth: null });
      expect(response.statusCode).to.equal(200);
      validateShopLocateNearbyOutletsApiSuccessResponse(body);
      body.outletList.forEach(outlet => {
        validateOutletReturnedByShopLocateNearbyOutletsApi(outlet);
      });
      expect(body.outletList.length).to.equal(0);
      testDoneFn();
    });

  });

  it('api/shop-locate-nearby-outlets (Geometry + searchString)', testDoneFn => {

    callApi('api/shop-locate-nearby-outlets', {
      json: {
        northEast: {
          lat: 1,
          lng: 1,
        },
        southWest: {
          lat: 12,
          lng: 20,
        },
        categoryCode: null,
        searchString: 'POoR'
      }
    }, (err, response, body) => {
      // console.dir(body, { depth: null });
      expect(response.statusCode).to.equal(200);
      validateShopLocateNearbyOutletsApiSuccessResponse(body);
      body.outletList.forEach(outlet => {
        validateOutletReturnedByShopLocateNearbyOutletsApi(outlet);
      });
      expect(body.outletList.length).to.equal(2);
      testDoneFn();
    });

  });

  it('api/shop-locate-nearby-outlets (Geometry + searchString)', testDoneFn => {

    callApi('api/shop-locate-nearby-outlets', {
      json: {
        northEast: {
          lat: 1,
          lng: 1,
        },
        southWest: {
          lat: 12,
          lng: 20,
        },
        categoryCode: null,
        searchString: 'Long'
      }
    }, (err, response, body) => {
      // console.dir(body, { depth: null });
      expect(response.statusCode).to.equal(200);
      validateShopLocateNearbyOutletsApiSuccessResponse(body);
      body.outletList.forEach(outlet => {
        validateOutletReturnedByShopLocateNearbyOutletsApi(outlet);
      });
      expect(body.outletList.length).to.equal(2);
      testDoneFn();
    });

  });

  it('api/shop-locate-nearby-outlets (Geometry + searchString (invalid))', testDoneFn => {

    callApi('api/shop-locate-nearby-outlets', {
      json: {
        northEast: {
          lat: 1,
          lng: 1,
        },
        southWest: {
          lat: 12,
          lng: 20,
        },
        categoryCode: null,
        searchString: 'POoRSADAD'
      }
    }, (err, response, body) => {
      // console.dir(body, { depth: null });
      expect(response.statusCode).to.equal(200);
      validateShopLocateNearbyOutletsApiSuccessResponse(body);
      body.outletList.forEach(outlet => {
        validateOutletReturnedByShopLocateNearbyOutletsApi(outlet);
      });
      expect(body.outletList.length).to.equal(0);
      testDoneFn();
    });

  });

  it('api/shop-locate-nearby-outlets (Geometry + categoryCode + searchString)', testDoneFn => {

    callApi('api/shop-locate-nearby-outlets', {
      json: {
        northEast: {
          lat: 1,
          lng: 1,
        },
        southWest: {
          lat: 12,
          lng: 20,
        },
        categoryCode: 'CAT_GYM',
        searchString: 'Long'
      }
    }, (err, response, body) => {
      // console.dir(body, { depth: null });
      expect(response.statusCode).to.equal(200);
      validateShopLocateNearbyOutletsApiSuccessResponse(body);
      body.outletList.forEach(outlet => {
        validateOutletReturnedByShopLocateNearbyOutletsApi(outlet);
      });
      expect(body.outletList.length).to.equal(1);
      testDoneFn();
    });

  });

  it('api/shop-get-outlet-details', testDoneFn => {

    callApi('api/shop-get-outlet-details', {
      json: {
        outletId: suite1Data.outlet1Id
      }
    }, (err, response, body) => {
      // console.dir(body, { depth: null });
      expect(response.statusCode).to.equal(200);
      validateShopGetOutletDetailsApiSuccessResponse(body);
      expect(body.otherOutletList.length).to.equal(1);
      expect(body.outletProductList.length).to.equal(1);
      expect(body.outletServiceList.length).to.equal(2);
      testDoneFn();
    });

  });

  it('Database: Restore', testDoneFn => {
    Promise.resolve()
      .then(() => getAsyncDatabase().engine.insertManyRaw(getAsyncDatabase().cacheOutletGeolocation.name, backupData))
      .catch(ex => console.error(ex))
      .then(testDoneFn())
  });

  // Geometric & Outlet Details Test - end

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});