This API handles attempt to return sold product.

url: `api/add-sales-return`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  salesId: Joi.number().max(999999999999999).required(),

  returnedProductList: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().max(999999999999999).required(),
      count: Joi.number().max(999999999999999).required()
    })
  ),
  creditedAmount: Joi.number().max(999999999999999).required()
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
{ code: PRODUCT_INVALID } // product not found
{ code: OUTLET_INVENTORY_INVALID } // outler returned inventory invalid
{ code: PRODUCT_CATEGORY_NON_RETURNABLE } // product in list is non-returnable
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success",
  "salesReturnId": Joi.number().max(999999999999999).required()
}
```

### db changes:
updates the `sales-return` and `customer` collection in db.