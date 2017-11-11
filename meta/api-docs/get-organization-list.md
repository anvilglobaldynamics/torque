This API handles the list of organizations to populate master container organization change selection.

url: `api/get-organization-list`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required()
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
```

### response (on success):
```
{
  "hasError": false,
  "organizationList": Joi.array().items(
    Joi.object().keys({
      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().alphanum().min(11).max(14).required(),
      email: Joi.string().email().min(3).max(30).required()
    });
  )
}
```

### db changes:
updates no collection in db.