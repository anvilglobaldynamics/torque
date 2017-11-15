url: `api/user-reset-password--confrm`

method: `POST`

### request: 
```js
{
  emailOrPhone: Joi.alternatives([
    Joi.string().email().min(3).max(30), // if email
    Joi.string().alphanum().min(11).max(14), // if phone
  ]).required()
  uniqueToken: Joi.string().length(16).required(),
  newPassword: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required()
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
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `user` collection in db.