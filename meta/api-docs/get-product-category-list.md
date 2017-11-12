This API handles get product categories to populate product category tree view and search result while adding product to inventory requirement.

url: `api/get-product-category-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().required()
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
      id: Joi.number().required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().required(),
      parentProductCategoryId: Joi.number().required(),
      unit: Joi.string().required(),
      defaultDiscountType: Joi.string().required(),
      defaultDiscountValue: Joi.number().required(),
      defaultPurchasePrice: Joi.number().required(),
      defaultVat: Joi.number().required(),
      defaultSalePrice: Joi.number().required(),
    });
  ),
}
```

### db changes:
updates no collection in db.