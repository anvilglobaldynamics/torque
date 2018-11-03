This API handles attempt to list all the modules currently supported.

url: `api/admin-get-module-list`

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
  hasError: true,
  error: {
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
  hasError: Joi.boolean().required().equal(false),
  moduleList: Joi.array().items(Joi.object().keys({
    code: Joi.string().required(),
    name: Joi.string().required()
  })).required()
}
```

### db changes:
updates no collection in db.