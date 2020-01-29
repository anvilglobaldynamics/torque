This API handles attempt to edit outlet’s information

url: `api/edit-outlet`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  outletId: Joi.number().max(999999999999999).required(),

  name: Joi.string().min(1).max(64).required(),
  physicalAddress: Joi.string().min(1).max(128).required(),
  contactPersonName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
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
{ code: OUTLET_INVALID } // outlet not found
{ code: PHONE_ALREADY_IN_USE } // the phone number is already associated with another organization
{ code: CATEGORY_INVALID }
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `outlet` collection in db.

### notes:
* same phone number can be used within same organization