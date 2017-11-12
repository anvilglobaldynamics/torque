This API handles attempt to transfer stock between inventories.

url: `api/transfer-between-inventories`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  fromInventoryId: Joi.number().required(),
  toInventoryId: Joi.number().required(),
  
  productList: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().required(),
      count: Joi.number().required()
    });
  );
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
{ code: FROM_INVENTORY_INVALID } // from inventory could not be found
{ code: TO_INVENTORY_INVALID } // to inventory could not be found
{ code: PRODUCT_INVALID } // product could not be found
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `inventory` and `transfer` collection in db.