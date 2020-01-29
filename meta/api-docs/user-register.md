This API handles signing up of a new user. After signing up, a user has 24 hours to 
click on the email validation link sent the email Address associated with it.

url: `api/user-register`

method: `POST`

### request: 
```js
{
  fullName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
  countryCode: Joi.string().regex(/^[a-z0-9\+]*$/i).min(2).max(4).required(),
  password: Joi.string().min(8).max(30).required(),
  hasAgreedToToc: Joi.boolean().required().valid(true)
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
{ code: PHONE_ALREADY_IN_USE } // the phone number is already associated
```

### response (on success):
Signup is successful
```js
{
  "hasError": false,
  "status": "success",
  "userId": Joi.number().max(999999999999999).required()
}
```

### db changes:
updates the `user` and `email-verification-request` collections in db.