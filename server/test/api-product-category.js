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
        defaultDiscountType: "%",
        defaultDiscountValue: 1,
        defaultPurchasePrice: 99,
        defaultVat: 2,
        defaultSalePrice: 111
      }
    }, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.have.property('hasError').that.equals(false);
      expect(body).to.have.property('status').that.equals('success');
      testDoneFn();
    })

  });

  // it('api/get-warehouse-list (Valid)', testDoneFn => {

  //   callApi('api/get-warehouse-list', {
  //     json: {
  //       apiKey,
  //       organizationId
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     expect(body).to.have.property('warehouseList').that.is.an('array');
  //     body.warehouseList.forEach(warehouse => {
  //       validateWarehouseSchema(warehouse);
  //     });
  //     warehouseList = body.warehouseList;
  //     testDoneFn();
  //   });

  // });

  // it('api/get-warehouse (Valid)', testDoneFn => {

  //   callApi('api/get-warehouse', {
  //     json: {
  //       apiKey,
  //       warehouseId: warehouseList[0].id
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     expect(body).to.have.property('warehouse');
  //     validateWarehouseSchema(body.warehouse);
  //     warehouseToBeModified = body.warehouse;
  //     testDoneFn();
  //   });

  // });

  // it('api/edit-warehouse (Valid)', testDoneFn => {

  //   callApi('api/edit-warehouse', {
  //     json: {
  //       apiKey,
  //       warehouseId: warehouseToBeModified.id,

  //       name: "My Warehouse",
  //       physicalAddress: "wayne manor address",
  //       phone: warehousePhone2,
  //       contactPersonName: "test contact person name"
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     expect(body).to.have.property('status').that.equals('success');
  //     testDoneFn();
  //   })

  // });

  // it('api/get-warehouse (Valid)', testDoneFn => {

  //   callApi('api/get-warehouse', {
  //     json: {
  //       apiKey,
  //       warehouseId: warehouseToBeModified.id
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     expect(body).to.have.property('warehouse');
  //     expect(body.warehouse.phone).to.equal(warehousePhone2);
  //     testDoneFn();
  //   });

  // });

  // it('api/delete-warehouse (Valid)', testDoneFn => {

  //   callApi('api/delete-warehouse', {
  //     json: {
  //       apiKey,
  //       warehouseId: warehouseToBeModified.id,
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     expect(body).to.have.property('status').that.equals('success');
  //     testDoneFn();
  //   })

  // });

  // it('api/get-warehouse (Deleted)', testDoneFn => {

  //   callApi('api/get-warehouse', {
  //     json: {
  //       apiKey,
  //       warehouseId: warehouseToBeModified.id
  //     }
  //   }, (err, response, body) => {
  //     expect(response.statusCode).to.equal(200);
  //     expect(body).to.have.property('hasError').that.equals(false);
  //     expect(body).to.have.property('warehouse');
  //     expect(body.warehouse.isDeleted).to.equal(true);
  //     testDoneFn();
  //   });

  // });

  it('END', testDoneFn => {
    terminateServer(testDoneFn);
  });

});