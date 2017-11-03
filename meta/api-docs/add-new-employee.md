This API handles adding new employee.

url: `api/add-new-employee`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),

  email: Joi.string().email().min(3).max(30).required(),
  phone: Joi.string().alphanum().min(11).max(14).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required(),

  role: Joi.string().required(),
  designation: Joi.string().required(),
  companyProvidedId: Joi.string().alphanum().required(),
  <!-- TODO: privileges -->

  fullName: Joi.string().min(1).max(64).required(),
  nid: Joi.string().min(16).max(16).required(),
  physicalAddress: Joi.string().min(1).max(128).required(),
  emergencyContact: Joi.number().min(6).max(11).required(),
  bloodGroup: Joi.alphanum().min(2).max(3).required(),
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
{ code: PHONE_ALREADY_IN_USE } // the phone number is already associated
{ code: ALREADY_EMPLOYED } // the user exists and is already employed by another organization
```

### response (on success):
```
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `employment` collection in db.