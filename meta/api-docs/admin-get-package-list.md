This API handles gets package list request.

url: `api/admin-get-package-list`

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
  "packageList": Joi.array().required()
}
```

### db changes:
updates No collection in db.