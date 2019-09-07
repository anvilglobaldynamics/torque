This API handles adding new employee.

url: `api/add-new-employee`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  fullName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
  password: Joi.string().min(8).max(30).required(),

  organizationId: Joi.number().max(999999999999999).required(),

  role: Joi.string().max(64).required(),
  designation: Joi.string().max(64).required(),
  companyProvidedId: Joi.string().allow('').max(64).required(),

  privileges: Joi.object().required().keys({
    [Look up privileges here](../server-db-docs/employment.js)
  }),
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
{ code: PHONE_ALREADY_IN_USE } // the phone number is already associated
{ code: ORGANIZATION_PACKAGE_LIMIT_REACHED }
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success",
  "userId": Joi.number().max(999999999999999).required(),
  "employmentId": Joi.number().max(999999999999999).required()
}
```

### db changes:
updates the `user` and `employment` collection in db.