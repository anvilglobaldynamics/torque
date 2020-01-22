Get summary of any user's latest employment in an organization intended for display only

url: `api/get-user-display-information`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  userId: Joi.number().max(999999999999999).required()
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
{ code: EMPLOYEE_INVALID } // employee does not exist
{ code: USER_INVALID } // employee does not exist
```

### response (on success):
```js
{
  "hasError": false,
  userDisplayInformation: Joi.object().keys({
    fullName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
    email: Joi.string().email().min(3).max(30).allow(null).required(),

    designation: Joi.string().max(64).required(),
    role: Joi.string().max(64).required(),
    companyProvidedId: Joi.string().allow('').max(64).required(),

    isActive: Joi.boolean().required()
  })
}
```

### db changes:
updates No collection in db.