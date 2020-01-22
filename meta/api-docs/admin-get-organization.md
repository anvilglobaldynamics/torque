This API handles search of an organization with phone number or email

url: `api/admin-get-organization`

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
{ code: ORGANIZATION_INVALID } // organization with this phone/email does not exist
```

### response (on success):
```js
{
  "hasError": false,

  "organization": Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    name: Joi.string().min(1).max(64).required(),
    primaryBusinessAddress: Joi.string().min(1).max(128).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
    email: Joi.string().email().min(3).max(30).required(),
    packageActivationId: Joi.number().max(999999999999999).allow(null).required(),
    isDeleted: Joi.boolean().required()
  });
}
```

### db changes:
updates no collection in db.