This API handles get organization’s outlet list request.

url: `api/get-outlet-list`

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
  "outletList": Joi.array().items(
    Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),

      location: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required(),
      categoryCode: Joi.string().required(),

      isDeleted: Joi.boolean().required()
    });
  )
}
```

### db changes:
updates no collection in db.