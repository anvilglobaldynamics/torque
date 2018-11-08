# WARNING! API DISABLED!

This API has been disabled.

# API

This API handles attempt to delete product-blueprint.

url: `api/delete-product-blueprint`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  productBlueprintId: Joi.number().max(999999999999999).required()
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
{ code: PRODUCT_BLUEPRINT_INVALID } // product blueprint does not exist
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `product-blueprint` collection in db.