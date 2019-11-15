This API is used to record user's location.

url: `api/analytics-report-user-location`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  location: Joi.object().keys({
    lat: Joi.number().required(),
    lng: Joi.number().required()
  }).required(),

  action: Joi.string().min(1).max(32).valid('homepage-after-login').required(),
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
  "status": "success",
}
```

### db changes:
updates the `user-location` collection in db.