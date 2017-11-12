This API handles get organization’s outlet list request.

url: `api/get-outlet-list`

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
  "outletList": Joi.array().items(
    Joi.object().keys({
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().required(),
      physicalAddress: Joi.string().min(1).max(128).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().alphanum().min(11).max(14).required()
    });
  )
}
```

### db changes:
updates no collection in db.