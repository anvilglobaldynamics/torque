This API handles get outlet category list request.

url: `api/get-outlet-category-list`

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
  "categoryList": Joi.array().required()
}
```

### db changes:
updates No collection in db.