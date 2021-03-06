This API handles user password reset attempt, ota.

url: `api/user-reset-password--request`

method: `POST`

### request: 
```js
{
  emailOrPhone: Joi.alternatives([
    Joi.string().email().min(3).max(30), // if email
    Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14) // if phone
  ]).required()
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
{ code: USER_NOT_FOUND } // no user is associated with the given id
{ code: USER_BANNED } // the user is banned
{ code: USER_REQUIRES_EMAIL_VERIFICATION } // the user requires email verification
{ code: USER_REQUIRES_PHONE_VERIFICATION } // the user requires phone verification
```

### response (on success):
```js
{
  "hasError": false
}
```

### db changes:
updates the `user` collection in db.

### notes:
* user can not reset password using unverified email or phone, client will ask user to contact support with that email or phone.
* user is sent an email with a link like `https://torque-client.com/#/password-reset/${uniqueToken}`