This API handles get product blueprints to populate product blueprint tree view and search result while adding product to inventory requirement.

url: `api/get-product-blueprint-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  searchString: Joi.string().min(0).max(64).allow('').optional(), // by name or identifierCode
  productBlueprintIdList: Joi.array().items(Joi.number()).default([]).optional() // takes precedence over searchString
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
```

### response (on success):
```js
{
  hasError: false,
  
  productBlueprintList: Joi.array().items(
    Joi.object().keys({
      id: Joi.number().max(999999999999999).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      unit: Joi.string().max(64).required(),
      identifierCode: Joi.string().max(64).allow('').required(),
      defaultPurchasePrice: Joi.number().max(999999999999999).required(),
      defaultVat: Joi.number().max(999999999999999).required(),
      defaultSalePrice: Joi.number().max(999999999999999).required(),
      productCategoryIdList: Joi.array().items(Joi.number()).required(),
      
      isDeleted: Joi.boolean().required(),
      isReturnable: Joi.boolean().required()
    });
  )
}
```

### db changes:
updates no collection in db.