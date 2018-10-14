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
  userDisplayInformation: {
    fullName, phone, email,
    designation, role, companyProvidedId, isActive
  }
}
```

### db changes:
updates No collection in db.