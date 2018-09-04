This API handles hiring an already existing user.

url: `api/hire-user-as-employee`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  userId: Joi.number().max(999999999999999).required(),

  organizationId: Joi.number().max(999999999999999).required(),
  role: Joi.string().max(1024).required(),
  designation: Joi.string().max(1024).required(),
  companyProvidedId: Joi.string().alphanum().allow('').max(1024).required(),
  
  privileges: Joi.object().required().keys({
    [Look up privileges here](../server-db-docs/employment.md)
  });
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
{ code: USER_INVALID } // could not be find user
{ code: ORGANIZATION_INVALID } // could not be find organization
{ code: ALREADY_EMPLOYED } // the user exists and is already employed by another organization
{ code: ORGANIZATION_PACKAGE_MAX_EMPLOYEE_LIMIT_REACHED }
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success",
  "employmentId": Joi.number().max(999999999999999).required()
}
```

### db changes:
updates the `employment` collection in db.