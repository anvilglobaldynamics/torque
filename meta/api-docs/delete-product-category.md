This API handles attempt to delete product-category.

url: `api/delete-product-category`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  productCategoryId: Joi.number().max(999999999999999).required()
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
{ code: PRODUCT_CATEGORY_INVALID } // product category does not exist
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `product-category` collection in db.