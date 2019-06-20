This API handles adding new product category.

url: `api/add-product-category`

method: `POST`

### request: 
```js
{
  organizationId: Joi.number().max(999999999999999).required(),

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
{ code: ORGANIZATION_INVALID } // the organization id is invalid
{ code: PRODUCT_CATEGORY_INVALID }
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success",
  "productCategoryId": Joi.number().max(999999999999999).required()
}
```

### db changes:
updates the `product-category` collection in db.

### notes:
