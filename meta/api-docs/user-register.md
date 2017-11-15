This API handles signing up of a new user. After signing up, a user has 24 hours to 
click on the email validation link sent the email Address associated with it.

url: `api/user-register`

method: `POST`

### request: 
```js
{
  email: Joi.string().email().min(3).max(30).required(),
  fullName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().alphanum().min(11).max(14).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required()
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
{ code: EMAIL_ALREADY_IN_USE } // the email id is already associated with an user
{ code: PHONE_ALREADY_IN_USE } // the phone number is already associated
```

### response (on success):
Signup is successful
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `user` and `email-verification-request` collections in db.