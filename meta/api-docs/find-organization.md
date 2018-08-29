This API handles search of an organization with phone number or email

url: `api/admin-find-organization`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  emailOrPhone: Joi.alternatives([
    Joi.string().email().min(3).max(30), // if email
    Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15) // if phone
  ]).required()
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
{ code: ORGANIZATION_DOES_NOT_EXIST } // organization with this phone/email does not exist
// TODO: below 2 are unused
{ code: PHONE_INVALID } // phone is not in system
{ code: EMAIL_INVALID } // email is not in system
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
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
    email: Joi.string().email().min(3).max(30).required(),
    licenceExpiresOnDatetimeStamp: Joi.number().max(999999999999999).required(),
    isDeleted: Joi.boolean().required()
  });
}
```

### db changes:
updates no collection in db.