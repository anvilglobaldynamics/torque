This API handles submission of sale form

url: `api/save-sales`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  salesId: Joi.number().allow(null).required(),

  outletId: Joi.number().required(),
  customerId: Joi.number().required(),

  productList: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().required(),
      count: Joi.number().required(),
      discountType: Joi.string().required(),
      discountValue: Joi.number().required(),
      salePrice: Joi.number().required()
    });
  );
  payment: Joi.object().keys({
    totalAmount: Joi.number().required(),
    vatAmount: Joi.number().required(),
    discountType: Joi.string().required(),
    discountValue: Joi.number().required(),
    discountedAmount: Joi.number().required(),
    serviceChargeAmount: Joi.number().required(),
    totalBilled: Joi.number().required(),
    previousCustomerBalance: Joi.number().required(),
    paidAmount: Joi.number().required(),
    changeAmount: Joi.number().required()
  });
}
```

### response (on error):
```js
{
  "hasError": true,
  "error": {
    code,
    message
  }
}
```

Possible Error Codes:
```js
{ code: VALIDATION_ERROR } // validation error on one of the fields
{ code: APIKEY_INVALID } // the api key is invalid
{ code: OUTLET_INVALID } // outlet could not be found 
{ code: CUSTOMER_INVALID } // customer could not be found
{ code: PRODUCT_INVALID } // product could not be found
{ code: INSUFFICIENT_PRODUCT } // not enough product in inventory
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `sales` and `inventory` collection in db.

### notes:
in future we could save draft sale in db.