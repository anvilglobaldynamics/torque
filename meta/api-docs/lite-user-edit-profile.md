This API handles attempt to edit user’s and organization's information.

url: `api/lite-user-edit-profile`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  organizationId: Joi.number().max(999999999999999).required(),

  fullName: Joi.string().min(1).max(64).required(),
  organizationName: Joi.string().min(1).max(64).required(),
  categoryCode: Joi.string().required(),
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
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `user`, `organization` and `outlet` collection in db.

### notes:
