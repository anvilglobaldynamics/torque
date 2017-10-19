
This API handles signing up of a new user. After signing up, a user has 24 hours to 
click on the email validation link sent the email Address associated with it.

url: `api/user-register`

method: `POST`

### request: 
```
{
  email: Joi.string().email().required().min(3).max(30),
  password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required()
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
{ code: EMAIL_ALREADY_IN_USE } // the email id is already associated with an user
```

### response (on success):
Signup is successful
```
{
  "hasError": false,
  "status": "success"
}
```

### notes:
updates the `user` and `email-verification-request` collections in db.
