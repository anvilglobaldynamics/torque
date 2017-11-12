This API handles adding new product category.

url: `api/add-product-category`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  organizationId: Joi.number().required(),
  parentProductCategoryId: Joi.number().allow(null).required(),

  name: Joi.string().min(1).max(64).required(),
  unit: Joi.string().required(),
  defaultDiscountType: Joi.string().required(),
  defaultDiscountValue: Joi.number().required(),
  defaultPurchasePrice: Joi.number().required(),
  defaultVat: Joi.number().required(),
  defaultSalePrice: Joi.number().required()
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
{ code: PARENT_PRODUCT_CATEGORY_INVALID } // the Parent Product Category is invalid
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