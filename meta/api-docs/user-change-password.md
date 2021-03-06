This API handles user password change attempt.

url: `api/user-change-password`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  oldPassword: Joi.string().min(8).max(30).required(),
  newPassword: Joi.string().min(8).max(30).required()
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
{ code: OLD_PASSWORD_INVALID } // the old password is invalid
{ code: APIKEY_INVALID } // the api key is invalid
```

### response (on success):
```js
{
  "hasError": false
}
```

### db changes:
updates the `user` and `session` collection in db.