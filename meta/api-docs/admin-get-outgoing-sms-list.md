This Api returns a list of outgoing SMSes

url: `api/admin-get-outgoing-sms-list`

method: `POST`

### request: 
```js
      apiKey: Joi.string().length(64).required(),
      date: Joi.number().max(999999999999999).required()
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
  "outgoingSmsList": Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    from: Joi.string().min(1).max(15).required(),
    to: Joi.string().min(1).max(15).required(),
    content: Joi.string().min(1).max(512).required(),
    status: Joi.string().valid('pending', 'sent', 'delivered', 'canceled').required(),
    isDeleted: Joi.boolean().required()
  });
}
```

### db changes:
updates No collection in db.