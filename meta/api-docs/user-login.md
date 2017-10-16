
This API handles logging in of an user.

url: `api/user-login`

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
{ code: USER_NOT_FOUND } // no user is associated with the given id
{ code: USER_BANNED } // the user is banned
{ code: USER_REQUIRES_EMAIL_VERIFICATION } // the user requires email verification
```

### response (on success):
Signup is successful
```
{
  "hasError": false,
  "status": "success"
  "apiKey": 64 character apiKey string
  "sessionId": Number
  "warning": string (optional. This property is passed when the user needs to be notified of something)
}
```

### notes:
updates the `user` and `session` collections in db.
