This API handles attempt to edit product-category information

url: `api/edit-product-category`

method: `POST`

### request: 
```js
{
  productCategoryId: Joi.number().max(999999999999999).required(),

  name: Joi.string().min(1).max(64).required(),
  colorCode: Joi.string().length(6).required(),
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
{ code: PRODUCT_CATEGORY_INVALID }
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

### notes:
