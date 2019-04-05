This API handles attempt to delete discount preset.

url: `api/delete-discount-preset`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  discountPresetId: Joi.number().max(999999999999999).required()
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
{ code: DISCOUNT_PRESET_INVALID }
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `discount-preset` collection in db.