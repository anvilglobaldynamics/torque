This API handles adding new employee.

url: `api/add-new-employee`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  email: Joi.string().email().min(3).max(30).required(),
  fullName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().alphanum().min(11).max(14).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required(),

  organizationId: Joi.number().max(999999999999999).required(),

  role: Joi.string().max(1024).required(),
  designation: Joi.string().max(1024).required(),
  companyProvidedId: Joi.string().alphanum().required(),

  privileges: Joi.object().keys({
    [Look up privileges here](../server-db-docs/employment.md)
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
{ code: EMAIL_ALREADY_IN_USE } // the email id is already associated with an user
{ code: PHONE_ALREADY_IN_USE } // the phone number is already associated
{ code: ALREADY_EMPLOYED } // the user exists and is already employed by the same organization
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success",
  userId: Joi.number().max(999999999999999).required(),
  employmentId: Joi.number().max(999999999999999).required()
}
```

### db changes:
updates the `user` and `employment` collection in db.