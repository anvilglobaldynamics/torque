This API handles attempt to Withdraw from change wallet balance.

url: `api/withdraw-from-change-wallet-balance`

method: `POST`

# WARNING! API DISABLED!

This API has been disabled.

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  customerId: Joi.number().max(999999999999999).required(),
  amount: Joi.number().min(1).max(999999999999999).required()
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
{ code: CUSTOMER_INVALID } // customer does not exist
```

### response (on success):
```js
{
  hasError: false,
  status: "success"
}
```

### db changes:
updates the `customer` collection in db.