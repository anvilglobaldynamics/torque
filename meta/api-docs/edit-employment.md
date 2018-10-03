This API handles employment properties such as edit designation, privileges, Fire etc

url: `api/edit-employment`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  employmentId: Joi.number().max(999999999999999).required(),

  isActive: Joi.boolean().required(), 

  role: Joi.string().max(64).required(),
  designation: Joi.string().max(64).required(),
  companyProvidedId: Joi.string().allow('').max(64).required(),
  
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
{ code: EMPLOYEE_INVALID } // the employmentId could not be found
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `employment` collection in db.

### notes:
`isActive` indicates if the employee is fired or not. 