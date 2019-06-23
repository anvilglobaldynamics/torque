This API handles get organization’s product category list request.

url: `api/get-product-category-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  searchString: Joi.string().min(0).max(32).allow('').optional(),
  productCategoryIdList: Joi.array().items(Joi.number()).optional(),
  searchBySearchString: Joi.boolean().default(true).optional()
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
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      organizationId: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      colorCode: Joi.string().length(6).required(),

      isDeleted: Joi.boolean().required()
    });
  )
}
```

### db changes:
updates no collection in db.