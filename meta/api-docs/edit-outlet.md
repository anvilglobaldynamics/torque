This API handles attempt to edit outlet’s information

url: `api/edit-outlet`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),
  name: Joi.string().min(1).max(64).required(),
  physicalAddress: Joi.string().min(1).max(128).required(),
  contactPersonName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().alphanum().min(11).max(14).required(),
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
{ code: PHONE_ALREADY_IN_USE } // the phone number is already associated with another organization
```

### response (on success):
```
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `outlet` collection in db.

### notes:
* same phone number can be used within same organization