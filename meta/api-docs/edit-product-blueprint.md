This API handles attempt to update the product blueprint.

url: `api/edit-product-blueprint`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  productBlueprintId: Joi.number().max(999999999999999).required(),
  
  name: Joi.string().min(1).max(64).required(),
  unit: Joi.string().max(64).required(),
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
{ code: PRODUCT_BLUEPRINT_INVALID } // product blueprint not found
{ code: DISCOUNT_VALUE_INVALID } // the discount value is more than sale price
```

### response (on success):
```js
{
  hasError: false,
  status: "success"
}
```

### db changes:
updates the `product-blueprint` collection in db.