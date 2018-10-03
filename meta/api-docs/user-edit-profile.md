This API handles attempt to edit user’s information.

url: `api/user-edit-profile`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  email: Joi.string().email().min(3).max(30).required(),
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),

  fullName: Joi.string().min(1).max(64).required(),
  nid: Joi.string().allow('').min(16).max(16).required(),
  physicalAddress: Joi.string().allow('').min(1).max(128).required(),
  emergencyContact: Joi.string().allow('').min(1).max(128).required(),
  bloodGroup: Joi.string().allow('').min(2).max(3).required()
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