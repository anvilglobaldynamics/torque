This API handles get organization’s discount preset list request.

url: `api/get-discount-preset-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  discountPresetIdList: Joi.array().items(Joi.number()).default([]).optional() 
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
{ code: DISCOUNT_PRESET_INVALID } // the discount preset is invalid
```

### response (on success):
```js
{
  "hasError": false,
  "discountPresetList": Joi.array().items(
    Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      discountType: Joi.string().valid('percent', 'fixed').required(),
      discountValue: Joi.number().max(999999999999999).required(),

      isDeleted: Joi.boolean().required()
    });
  )
}
```

### db changes:
updates no collection in db.