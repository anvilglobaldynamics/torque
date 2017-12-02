url: `api/user-reset-password--validate`

method: `POST`

### request: 
```js
{
  uniqueToken: Joi.string().length(16).required(),
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
{ code: PASSWORD_RESET_TOKEN_INVALID } // validation error on one of the fields
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