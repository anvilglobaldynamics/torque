This API sets the status of an outgoing sms

url: `api/admin-set-outgoing-sms-status`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  status: Joi.string().valid('pending', 'sent', 'delivered', 'canceled').required(),
  outgoingSmsId: Joi.number().max(999999999999999).required()
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
{ code: OUTGOING_SMS_INVALID } // no outgoing sms found with the given ID
```

### response (on success):
```js
{
  hasError: Joi.boolean().required().equal(false),
  status: Joi.string().required().equal('success')
}
```

### db changes:
updates `outgoingSms`