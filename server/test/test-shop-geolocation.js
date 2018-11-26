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
  getAsyncDatabase
} = require('./lib');

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


describe.skip('Shop : Geolocation', _ => {

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

  // Geometric Test - end

  let geometricTest = {
    organizationId: null,
    outlet1Id: null,
    outlet2Id: null,
  }

  it('Preparing for geometric test', testDoneFn => {
    let { promisifyApiCall } = require('./lib');

    Promise.resolve()
      .then(() => getAsyncDatabase().engine.deleteMany(getAsyncDatabase().cacheOutletGeolocation.name, {}))
      .then(() => promisifyApiCall({}, addOrganization, {
        apiKey,
        name: orgName,
        primaryBusinessAddress: orgBusinessAddress,
        phone: orgPhone,
        email: orgEmail
      }))
      .then(({ organizationId }) => geometricTest.organizationId = organizationId)

      .then(() => promisifyApiCall({}, addOutlet, {
        apiKey,
        organizationId: geometricTest.organizationId,
        name: outletName,
        physicalAddress: outletPhysicalAddress,
        phone: outletPhone,
        contactPersonName: outletContactPersonName,
        location: { lat: 4, lng: 5 },
        categoryCode: 'CAT_GENERAL'
      }))
      .then(({ outletId }) => geometricTest.outlet1Id = outletId)

      .then(() => promisifyApiCall({}, addOutlet, {
        apiKey,
        organizationId: geometricTest.organizationId,
        name: outletName,
        physicalAddress: outletPhysicalAddress,
        phone: outletPhone,
        contactPersonName: outletContactPersonName,
        location: { lat: 5, lng: 6 },
        categoryCode: 'CAT_GYM'
      }))
      .then(({ outletId }) => geometricTest.outlet2Id = outletId)

      .catch(ex => console.error(ex))

      .then(() => {
        // console.log('final test object', geometricTest);
        testDoneFn();
      });

  });

  it('api/shop-locate-nearby-outlets', testDoneFn => {

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
        productName: ''
      }
    }, (err, response, body) => {
      // console.log(require('util').inspect(body, { depth: null }));
      console.dir(body, { depth: null })
      expect(response.statusCode).to.equal(200);
      // validateGetServiceMembershipListApiSuccessResponse(body);
      // body.serviceMembershipList.forEach(serviceMembership => {
      //   validateServiceMembershipSchemaWhenListObj(serviceMembership);
      // });
      expect(body.outletList.length).to.equal(2);
      testDoneFn();
    });

  });

  it('api/shop-locate-nearby-outlets', testDoneFn => {

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
        productName: ''
      }
    }, (err, response, body) => {
      // console.log(require('util').inspect(body, { depth: null }));
      console.dir(body, { depth: null })
      expect(response.statusCode).to.equal(200);
      // validateGetServiceMembershipListApiSuccessResponse(body);
      // body.serviceMembershipList.forEach(serviceMembership => {
      //   validateServiceMembershipSchemaWhenListObj(serviceMembership);
      // });
      expect(body.outletList.length).to.equal(1);
      testDoneFn();
    });

  });

  // Geometric Test - end

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});