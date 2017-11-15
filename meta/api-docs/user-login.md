This API handles logging in of an user.

url: `api/user-login`

method: `POST`

### request: 
```js
{
  emailOrPhone: Joi.alternatives([
    Joi.string().email().min(3).max(30), // if email
    Joi.string().alphanum().min(11).max(14), // if phone
  ]).required(),
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
{ code: WRONG_PASSWORD } // the password didn't match
{ code: USER_NOT_FOUND } // no user is associated with the given id
{ code: USER_BANNED } // the user is banned
{ code: USER_REQUIRES_EMAIL_VERIFICATION } // the user requires email verification
{ code: USER_REQUIRES_PHONE_VERIFICATION } // the user requires phone verification
```

### response (on success):
Signup is successful
```js
{
  "hasError": false,
  "status": "success"
  "apiKey": 64 character apiKey string
  "sessionId": Number
  "warning": string (optional. This property is passed when the user needs to be notified of something)
  "user": { 
    fullName: String
    email: String
    phone: String
    nid: String
    physicalAddress: String
    emergencyContact: String
    bloodGroup: String
  },
}
```

### db changes:
updates the `session` collections in db.