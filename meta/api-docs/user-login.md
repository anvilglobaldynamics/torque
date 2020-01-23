This API handles logging in of an user.

url: `api/user-login`

method: `POST`

### request: 
```js
{
  emailOrPhone: Joi.alternatives([
    Joi.string().email().min(3).max(30), // if email
    Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14) // if phone
  ]).required(),
  countryCode: Joi.string().regex(/^[a-z0-9\+]*$/i).min(2).max(4).required(),
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
{ code: WRONG_PASSWORD } // the password didn't match
{ code: USER_NOT_FOUND } // no user is associated with the given id
{ code: USER_BANNED } // the user is banned
{ code: USER_REQUIRES_EMAIL_VERIFICATION } // the user requires email verification
{ code: USER_REQUIRES_PHONE_VERIFICATION } // the user requires phone verification
{ code: PHONE_VERIFICATION_REQUEST_NOT_FOUND }
{ code: EMAIL_VERIFICATION_REQUEST_NOT_FOUND }
{ code: APP_ACCESS_DENIED } // User is not permitted to use the app. (Lipi user trying to use Lipi Lite and so on)
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
  "apiKey": 64 character apiKey string
  "sessionId": Number
  "warning": string (optional. This property is passed when the user needs to be notified of something)
  "user": { 
    id: Number
    fullName: String
    email: String
    phone: String
    nid: String
    physicalAddress: String
    emergencyContact: String
    bloodGroup: String
    agreedToTocDatetimeStamp: Number
  },
}
```

### db changes:
updates the `session` collections in db.