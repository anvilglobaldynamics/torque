This API sets the status user banning

url: `api/admin-set-user-banning-status`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  isBanned: Joi.boolean().required(),
  userId: Joi.number().max(999999999999999).required(),
}
```

### response (on error):
```js
{
  hasError: true,
  error: {
    code,
    message
  }
}
```

Possible Error Codes:
```js
{ code: VALIDATION_ERROR } // validation error on one of the fields
{ code: APIKEY_INVALID } // the api key is invalid
{ code: USER_INVALID } // no user found with the given ID
```

### response (on success):
```js
{
  hasError: Joi.boolean().required().equal(false),
  status: Joi.string().required().equal('success')
}
```

### db changes:
updates `user`