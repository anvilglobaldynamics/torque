This API handles adding new outlet.

url: `api/add-outlet`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  name: Joi.string().min(1).max(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  physicalAddress: Joi.string().min(1).max(128).required(),
  contactPersonName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
  location: Joi.object().keys({
    lat: Joi.number().required(),
    lng: Joi.number().required()
  }).required(),
  categoryCode: Joi.string().required()
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
{ code: PHONE_ALREADY_IN_USE } // the phone number is already associated with another organization
{ code: ORGANIZATION_PACKAGE_MAX_OUTLET_LIMIT_REACHED }
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success",
  "outletId": Joi.number().max(999999999999999).required()
}
```

### db changes:
updates the `outlet` collection in db.

### notes:
* same phone number can be used within same organization