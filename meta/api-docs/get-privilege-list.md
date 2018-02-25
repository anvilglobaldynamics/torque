This API handles gets privilege list to be assigned to new employee request.

url: `api/get-privilege-list`

method: `POST`

### request: 
```js
{}
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
  "privilegeList": Joi.array().items(Joi.string().max(1024).required())
}
```

### db changes:
updates No collection in db.