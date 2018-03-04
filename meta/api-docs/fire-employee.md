This API handles attempt to fire employee.

url: `api/fire-employee`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  employmentId: Joi.number().max(999999999999999).required()
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
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `employee` collection in db.