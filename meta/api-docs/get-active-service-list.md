This API handles get active service list in a outlet request.

url: `api/get-active-service-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  outletId: Joi.number().max(999999999999999).required()
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
{ code: OUTLET_INVALID } // outlet not found
```

### response (on success):
```js
{
  hasError: false,

  serviceList: Joi.array().min(0).items(
    Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      createdByUserId: Joi.number().max(999999999999999).required(),

      serviceBlueprintId: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().min(0).max(999999999999999).required(),

      outletId: Joi.number().max(999999999999999).required(),
      isAvailable: Joi.boolean().required()
    });
  )
}
```

### db changes:
updates no collection in db.