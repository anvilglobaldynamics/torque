This API handles attempt to edit user’s information.

url: `api/user-edit-profile`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  email: Joi.string().email().min(3).max(30).required(),
  phone: Joi.string().alphanum().min(11).max(14).required(),

  fullName: Joi.string().min(1).max(64).required(),
  nid: Joi.string().min(16).max(16).required(),
  physicalAddress: Joi.string().min(1).max(128).required(),
  emergencyContact: Joi.number().min(6).max(11).required(),
  bloodGroup: Joi.alphanum().min(2).max(3).required()
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
{ code: APIKEY_INVALID } // the api key is invalid
{ code: EMAIL_ALREADY_IN_USE } // the email id is already associated with an user
{ code: PHONE_ALREADY_IN_USE } // the phone number is already associated
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `user` collection in db.

### notes:
* changing `phone` and `email` will result in `isPhoneVerified` and `isEmailVerified` reset respectively.
* changing `phone`, `email`, `nid`, `emergencyContact` and `physicalAddress` will keep a log of the old value in the `personalInformationHistory` array in the format `{ field: String, value: String, changedOn: DatetimeStamp }`