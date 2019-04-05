This API handles attempt to edit outlet’s information

url: `api/edit-discount-preset`

method: `POST`

### request: 
```js
{
  discountPresetId: Joi.number().max(999999999999999).required(),

  name: Joi.string().min(1).max(64).required(),
  discountType: Joi.string().valid('percent', 'fixed').required(),
  discountValue: Joi.number().max(999999999999999).required(),
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

### notes:
