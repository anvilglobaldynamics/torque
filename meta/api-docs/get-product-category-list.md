This API handles get product categories to populate product category tree view and search result while adding product to inventory requirement.

url: `api/get-product-category-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required()
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
```

### response (on success):
```js
{
  "hasError": false,
  
  "productCategoryList": Joi.array().items(
    Joi.object().keys({
      id: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      parentProductCategoryId: Joi.number().max(999999999999999).allow(null).required(),
      unit: Joi.string().max(1024).required(),
      defaultDiscountType: Joi.string().max(1024).required(),
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
    });
  ),
}
```

### db changes:
updates no collection in db.