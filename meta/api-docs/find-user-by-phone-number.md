This API handles check of a phone number being in system or not

url: `api/find-user-by-phone-number`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),
  phone: Joi.string().alphanum().min(11).max(14).required()
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
{ code: PHONE_INVALID } // phone is not in system
```

### response (on success):
```
{
  "hasError": false
}
```

### db changes:
updates no collection in db.