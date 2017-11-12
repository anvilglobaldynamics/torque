This API handles attempt to update customer balance.

url: `api/adjust-customer-balance`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  customerId: Joi.number().required(),

  action: Joi.string().required().valid('payment', 'withdrawl'), 
  balance: Joi.number().required()
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
{ code: CUSTOMER_INVALID } // customer does not exist
{ code: ACTION_INVALID } // action is neither 'payment' nor 'withdrawl'
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `customer` collection in db.