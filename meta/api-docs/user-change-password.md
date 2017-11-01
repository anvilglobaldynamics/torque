This API handles user password change attempt.

url: `api/user-change-password`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),
  oldPassword: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required(),
  newPassword: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required()
}
```

### response (on error):
```
{
  "hasError": true,
  "error": {
    code,
    message
  }
}
```
Possible Error Codes:
```
{ code: VALIDATION_ERROR } // validation error on one of the fields
{ code: OLD_PASSWORD_INVALID } // the old password is invalid
{ code: APIKEY_INVALID } // the api key is invalid
```

### response (on success):
```
{
  "hasError": false
}
```

### db changes:
updates the `user` and `session` collection in db.