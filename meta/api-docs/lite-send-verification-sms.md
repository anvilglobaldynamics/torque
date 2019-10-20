This API handles sending verification sms

url: `api/lite-send-verification-sms`

method: `POST`

### request: 
```js
{
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required()
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
```

### response (on success):
```js
{
  hasError: false,
  "status": "success"  
}
```

### db changes:
Updated `phoneVerificationRequst` collection