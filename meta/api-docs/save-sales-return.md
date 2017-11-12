This API handles attempt to return sold product.

url: `api/save-sales-return`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  salesId: Joi.number().allow(null).required(),

  returnedProductList: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().required(),
      count: Joi.number().required()
    });
  ),
  creditedAmount: Joi.number().required()
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
{ code: SALES_INVALID } // sales not found
{ code: PORDUCT_INVALID } // product not found
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `sales-return` and `customer` collection in db.