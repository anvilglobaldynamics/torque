This API handles attempt to add an warehouse.

url: `api/add-warehouse`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  name: Joi.string().min(1).max(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  physicalAddress: Joi.string().min(1).max(128).required(),
  contactPersonName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required()
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
{ code: ORGANIZATION_PACKAGE_LIMIT_REACHED }
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success",
  "warehouseId": Joi.number().max(999999999999999).required()
}
```

### db changes:
updates the `warehouse` collection in db.

### notes:
* same phone number can be used within same organization