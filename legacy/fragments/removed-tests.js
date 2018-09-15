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

// from test-product-category-apis.js =

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