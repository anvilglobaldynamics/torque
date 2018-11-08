// from test-customer-apis.js =

it('api/delete-customer (Valid): ', testDoneFn => {

  callApi('api/delete-customer', {
    json: {
      apiKey,
      customerId: firstCustomer.id
    }
  }, (err, response, body) => {
    expect(response.statusCode).to.equal(200);
    validateGenericApiSuccessResponse(body);
    testDoneFn();
  })

});


it('api/get-customer (Deleted): ', testDoneFn => {

  callApi('api/get-customer', {
    json: {
      apiKey,
      customerId: firstCustomer.id
    }
  }, (err, response, body) => {
    expect(response.statusCode).to.equal(200);
    validateGenericApiFailureResponse(body);
    expect(body.error.code).equals('CUSTOMER_INVALID');
    testDoneFn();
  })

});

it('api/delete-customer (Invalid): ', testDoneFn => {

  callApi('api/delete-customer', {
    json: {
      apiKey,
      customerId: invalidCustomerId
    }
  }, (err, response, body) => {
    expect(response.statusCode).to.equal(200);
    validateGenericApiFailureResponse(body);
    expect(body.error.code).equals('CUSTOMER_INVALID');
    testDoneFn();
  })

});

// from test-product-blueprint-apis.js =

it.skip('api/delete-product-blueprint (Invalid productBlueprintId)', testDoneFn => {

  callApi('api/delete-product-blueprint', {
    json: {
      apiKey,
      productBlueprintId: invalidProductBlueprintId
    }
  }, (err, response, body) => {
    expect(response.statusCode).to.equal(200);
    validateGenericApiFailureResponse(body);
    expect(body.error.code).equal('PRODUCT_BLUEPRINT_INVALID');
    testDoneFn();
  })

});

it.skip('api/delete-product-blueprint (Valid)', testDoneFn => {

  callApi('api/delete-product-blueprint', {
    json: {
      apiKey,
      productBlueprintId: productBlueprintTwo.id
    }
  }, (err, response, body) => {
    expect(response.statusCode).to.equal(200);
    validateGenericApiSuccessResponse(body);
    testDoneFn();
  })

});

it.skip('api/get-product-blueprint-list (Valid deletion check)', testDoneFn => {

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

    let oldList = productBlueprintList;
    productBlueprintList = body.productBlueprintList;
    expect(productBlueprintList.length + 1).to.equal(oldList.length);

    testDoneFn();
  });

});

it.skip('api/delete-product-blueprint (Invalid parent deletetion)', testDoneFn => {

  callApi('api/delete-product-blueprint', {
    json: {
      apiKey,
      productBlueprintId: productBlueprintOne.id
    }
  }, (err, response, body) => {
    expect(response.statusCode).to.equal(200);
    validateGenericApiFailureResponse(body);
    expect(body.error.code).equal('PRODUCT_BLUEPRINT_NOT_CHILDLESS');
    testDoneFn();
  })

});

// from test-organization-apis.js =

it.skip('api/add-organization (Invalid, copy phone)', testDoneFn => {

  callApi('api/add-organization', {
    json: {
      apiKey,
      name: "My Organization",
      primaryBusinessAddress: "My Address",
      phone: orgPhone,
      email: org2Email
    }
  }, (err, response, body) => {
    expect(response.statusCode).to.equal(200);
    expect(body).to.have.property('hasError').that.equals(true);
    expect(body).to.have.property('error');
    expect(body.error).to.have.property('code').that.equals('PHONE_ALREADY_IN_USE');
    testDoneFn();
  })

});

it.skip('api/add-organization (Invalid, copy email)', testDoneFn => {

  callApi('api/add-organization', {
    json: {
      apiKey,
      name: "My Organization",
      primaryBusinessAddress: "My Address",
      phone: org2Phone,
      email: orgEmail
    }
  }, (err, response, body) => {
    expect(response.statusCode).to.equal(200);
    expect(body).to.have.property('hasError').that.equals(true);
    expect(body).to.have.property('error');
    expect(body.error).to.have.property('code').that.equals('EMAIL_ALREADY_IN_USE');
    testDoneFn();
  })

});


it.skip('api/edit-organization (Invalid, copy phone)', testDoneFn => {

  callApi('api/edit-organization', {
    json: {
      apiKey,
      organizationId: organizationToBeEdited.id,
      name: organizationToBeEdited.name,
      primaryBusinessAddress: organizationToBeEdited.primaryBusinessAddress,
      phone: org2Phone,
      email: organizationToBeEdited.email
    }
  }, (err, response, body) => {
    expect(response.statusCode).to.equal(200);
    expect(body).to.have.property('hasError').that.equals(true);
    expect(body).to.have.property('error');
    expect(body.error).to.have.property('code').that.equals('PHONE_ALREADY_IN_USE');
    testDoneFn();
  });

});

it.skip('api/edit-organization (Invalid, copy email)', testDoneFn => {

  callApi('api/edit-organization', {
    json: {
      apiKey,
      organizationId: organizationToBeEdited.id,
      name: organizationToBeEdited.name,
      primaryBusinessAddress: organizationToBeEdited.primaryBusinessAddress,
      phone: organizationToBeEdited.phone,
      email: org2Email
    }
  }, (err, response, body) => {
    expect(response.statusCode).to.equal(200);
    expect(body).to.have.property('hasError').that.equals(true);
    expect(body).to.have.property('error');
    expect(body.error).to.have.property('code').that.equals('EMAIL_ALREADY_IN_USE');
    testDoneFn();
  });

});

// from test-outlet-apis.js =

it.skip('api/add-outlet (Invalid, copy phone)', testDoneFn => {

  callApi('api/add-outlet', {
    json: {
      apiKey,
      organizationId,
      name: "My Outlet",
      physicalAddress: "batcave address",
      phone: outletPhone,
      contactPersonName: "test contact person name"
    }
  }, (err, response, body) => {
    expect(response.statusCode).to.equal(200);
    expect(body).to.have.property('hasError').that.equals(true);
    expect(body).to.have.property('error');
    expect(body.error).to.have.property('code').that.equals('PHONE_ALREADY_IN_USE');
    testDoneFn();
  })

});

// from test-warehouse-apis.js =

it.skip('api/add-warehouse (Invalid copy phone)', testDoneFn => {

  callApi('api/add-warehouse', {
    json: {
      apiKey,
      organizationId,
      name: "My Warehouse",
      physicalAddress: "wayne manor address",
      phone: warehousePhone,
      contactPersonName: "test contact person name"
    }
  }, (err, response, body) => {
    expect(response.statusCode).to.equal(200);
    expect(body).to.have.property('hasError').that.equals(true);
    expect(body).to.have.property('error');
    expect(body.error.code).to.equal('PHONE_ALREADY_IN_USE');

    testDoneFn();
  })

});


it.skip('api/edit-warehouse (Invalid copy phone)', testDoneFn => {

  callApi('api/edit-warehouse', {
    json: {
      apiKey,
      warehouseId: warehouseToBeModified.id,

      name: "My Warehouse",
      physicalAddress: "wayne manor address",
      phone: warehousePhone2,
      contactPersonName: "test contact person name"
    }
  }, (err, response, body) => {
    expect(response.statusCode).to.equal(200);
    validateGenericApiFailureResponse(body);
    expect(body.error.code).equal('PHONE_ALREADY_IN_USE');
    testDoneFn();
  })

});