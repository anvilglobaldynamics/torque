This API handles gets designation list to be assigned to new employee request.

url: `api/get-designation-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required()
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
```

### response (on success):
```js
{
  "hasError": false,
  "designationList": Joi.array().items(Joi.string().max(1024).required())
}
```

### db changes:
updates No collection in db.