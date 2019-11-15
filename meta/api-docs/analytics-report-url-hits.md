This API is used to report url hits

url: `api/analytics-report-url-hit`

method: `POST`

### request: 
```js
{
  pssk: Joi.string().length(12).required(),
  name: Joi.string().min(8).max(32).required()
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
{ code: PSSK_INVALID } // Preshared Secret Key is Inavlid
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success",
}
```

### db changes:
updates the `url-analytics` collection in db.