This API handles logging out of an user making the apiKey invalid.

url: `api/user-logout`

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
Logout is successful
```
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `session` collection in db.