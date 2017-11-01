This API handles adding new organization.

url: `api/add-organization`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),
  name: Joi.string().min(1).max(64).required(),
  primaryBusinessAddress: Joi.string().min(1).max(128).required(),
  phone: Joi.string().alphanum().min(11).max(14).required(),
  email: Joi.string().email().min(3).max(30).required(),
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
{ code: APIKEY_INVALID } // the api key is invalid
{ code: EMAIL_ALREADY_IN_USE } // the email id is already associated
{ code: PHONE_ALREADY_IN_USE } // the phone number is already associated
```

### response (on success):
```
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `organization` collection in db.