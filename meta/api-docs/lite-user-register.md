This API handles signing up of a new user from torque lite.

url: `api/lite-user-register`

method: `POST`

### request: 
```js
{
  organizationName: Joi.string().min(1).max(64).required(),
  categoryCode: Joi.string().required(),
  fullName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
  countryCode: Joi.string().regex(/^[a-z0-9\+]*$/i).min(2).max(4).required(),
  password: Joi.string().min(8).max(30).required(),
  // verificationToken: Joi.string().length(5).required(), // NOTE: Not currently validating user
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
  "userId": Joi.number().max(999999999999999).required(),
  "organizationId": Joi.number().max(999999999999999).required(),
  "employmentId": Joi.number().max(999999999999999).required(),
}
```

### db changes:
updates the `user` collections in db.