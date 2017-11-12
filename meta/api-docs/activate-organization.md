This API handles attempt to submit organization activation key.

url: `api/activate-organization`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().required(),
  activationKey: Joi.string().length(19).required() // XXXX-XXXX-XXXX-XXXX
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
{ code: ORGANIZATION_INVALID } // the organization id is invalid
{ code: ACTIVATION_KEY_INVALID } // the avtivation key is invalid
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `organization` and `activation-key` collection in db.