This API checks a verification token but does not mark it as used.

url: `api/lite-check-verification-token`

method: `POST`

### request: 
```js
{
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
  verificationToken: Joi.string().length(5).required()
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
{ code: PHONE_VERIFICATION_TOKEN_INVALID } // Invalid phone verification request provided
```

### response (on success):
```js
{
  hasError: false,
  "status": "success"  
}
```

### db changes:
updates no collection in db.