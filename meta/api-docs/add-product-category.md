This API handles adding new product category.

url: `api/add-product-category`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  
  name: Joi.string().min(1).max(64).required(),
  unit: Joi.string().max(1024).required(),
  defaultDiscountType: Joi.string().valid('percent', 'fixed').required(),
  defaultDiscountValue: Joi.number().when(
    'defaultDiscountType', { 
      is: 'percent', 
      then: Joi.number().min(0).max(100).required(), 
      otherwise: Joi.number().max(999999999999999).required() 
    }
  ),
  defaultPurchasePrice: Joi.number().max(999999999999999).required(),
  defaultVat: Joi.number().max(999999999999999).required(),
  defaultSalePrice: Joi.number().max(999999999999999).required(),
  isReturnable: Joi.boolean().required()
}
```

### response (on error):
```js
{
  hasError: true,
  error: {
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
  hasError: false,
  status: "success",
  productCategoryId: Joi.number().max(999999999999999).required()
}
```

### db changes:
updates the `product-category` collection in db.