This API can be used to resend sales receipts

url: `api/resend-sales-receipt`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  salesId: Joi.number().max(999999999999999).required(),
  sentVia: Joi.string().valid('none', 'print', 'email', 'sms', 'own-sms').required(),
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
{ code: SALES_INVALID } // sales could not be found 
{ code: CUSTOMER_REQUIRED } // a customer is required
{ code: CUSTOMER_INVALID } // customer must have an email id to be valid receipt target
```

### response (on success):
```js
{
  "hasError": false,
  status: "success",
  receiptToken: Joi.string().length(6).required(),
  sentVia: Joi.string().valid('none', 'print', 'email', 'sms', 'own-sms').required(),
}
```

### db changes:
updates the `receipt` collection in db.

