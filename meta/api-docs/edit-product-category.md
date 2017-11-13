This API handles attempt to update the product category.

url: `api/edit-product-category`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  productCategoryId: Joi.number().max(999999999999999).required(),
  parentProductCategoryId: Joi.number().max(999999999999999).required(),
  name: Joi.string().min(1).max(64).required(),
  unit: Joi.string().required(),
  defaultDiscountType: Joi.string().required(),
  defaultDiscountValue: Joi.number().max(999999999999999).required(),
  defaultPurchasePrice: Joi.number().max(999999999999999).required(),
  defaultVat: Joi.number().max(999999999999999).required(),
  defaultSalePrice: Joi.number().max(999999999999999).required()
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
{ code: PRODUCT_CATEGORY_INVALID } // product category not found
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