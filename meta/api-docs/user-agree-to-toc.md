This API handles attempt to edit user’s information.

url: `api/user-edit-profile`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
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
  "status": "success"
  agreedToTocDatetimeStamp: Joi.number().required()
}
```

### db changes:
updates the `user` collection in db.

