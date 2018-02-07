This API handles search of an user with phone number or email

url: `api/find-user`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  emailOrPhone: Joi.alternatives([
    Joi.string().email().min(3).max(30), // if email
    Joi.string().alphanum().min(11).max(14), // if phone
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
{ code: USER_DOES_NOT_EXIST } // User with this phone/email does not exist
// TODO: below 2 are unused
{ code: PHONE_INVALID } // phone is not in system
{ code: EMAIL_INVALID } // email is not in system
```

### response (on success):
```js
{
  "hasError": false,
  "user": Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    fullName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().alphanum().min(11).max(14).required(),
    passwordHash: Joi.string().min(64).max(64).required(),
    email: Joi.string().email().min(3).max(30).required(),
    nid: Joi.string().min(16).max(16).required(),
    physicalAddress: Joi.string().min(1).max(128).required(),
    emergencyContact: Joi.number().min(6).max(11).required(),
    bloodGroup: Joi.alphanum().min(2).max(3).required(),
    isPhoneVerified: Joi.boolean().required(),
    isEmailVerified: Joi.boolean().required(),
    isDeleted: Joi.boolean().required(),
    isBanned: Joi.boolean().required()
  });
}
```

### db changes:
updates no collection in db.