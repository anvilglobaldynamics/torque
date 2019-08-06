This API handles adding new vendor.

url: `api/add-vendor`

method: `POST`

### request: 
```js
{
  organizationId: Joi.number().max(999999999999999).required(),

  name: Joi.string().min(1).max(64).required(),
  contactPersonName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
  physicalAddress: Joi.string().min(1).max(128).required(),
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
  "status": "success",
  "vendorId": Joi.number().max(999999999999999).required()
}
```

### db changes:
updates the `vendor` collection in db.