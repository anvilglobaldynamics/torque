This API handles submission of sale form

url: `api/add-sales`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  outletId: Joi.number().max(999999999999999).required(),
  customerId: Joi.number().max(999999999999999).allow(null).required(),

  productList: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().max(999999999999999).required(),
      count: Joi.number().max(999999999999999).required(),
      discountType: Joi.string().max(1024).required(),
      discountValue: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required()
    })
  ),
  payment: Joi.object().keys({
    totalAmount: Joi.number().max(999999999999999).required(),
    vatAmount: Joi.number().max(999999999999999).required(),
    discountType: Joi.string().max(1024).required(),
    discountValue: Joi.number().max(999999999999999).required(),
    discountedAmount: Joi.number().max(999999999999999).required(),
    serviceChargeAmount: Joi.number().max(999999999999999).required(),
    totalBilled: Joi.number().max(999999999999999).required(),
    previousCustomerBalance: Joi.number().max(999999999999999).allow(null).required(),
    paidAmount: Joi.number().max(999999999999999).required(),
    changeAmount: Joi.number().max(999999999999999).required()
  })
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
  "status": "success",
  salesId: Joi.number().max(999999999999999).allow(null).required()
}
```

### db changes:
updates the `sales`, `customer` and `inventory` collection in db.

### notes:
in future we could save draft sale in db.