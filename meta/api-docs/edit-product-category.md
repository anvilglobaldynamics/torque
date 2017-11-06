This API handles attempt to update the product category.

url: `api/edit-product-category`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),

  <!-- TODO: can we change parent category? parentProductCategoryId: Joi.number().required(), -->

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
```
{
  "hasError": true,
  "error": {
    code,
    message
  }
}
```
Possible Error Codes:
```
{ code: VALIDATION_ERROR } // validation error on one of the fields
{ code: APIKEY_INVALID } // the api key is invalid
{ code: PARENT_PRODUCT_CATEGORY_INVALID } // the Parent Product Category is invalid
```

### response (on success):
```
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `product-category` collection in db.