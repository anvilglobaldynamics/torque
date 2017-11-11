This API handles gets privilege list to be assigned to new employee request.

url: `api/get-privilege-list`

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
  "privilegeList": Joi.array().items(Joi.string().required())
}
```

### db changes:
updates No collection in db.