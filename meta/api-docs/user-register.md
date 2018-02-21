This API handles signing up of a new user. After signing up, a user has 24 hours to 
click on the email validation link sent the email Address associated with it.

url: `api/user-register`

method: `POST`

### request: 
```js
{
  fullName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().alphanum().min(11).max(14).required(),
  password: Joi.string().min(8).max(30).required()
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