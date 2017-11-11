This API handles attempt to update customer balance.

url: `api/debit-or-credit-customer-balance`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),
  customerId: Joi.number().required(),

  action: Joi.string().required(),
  balance: Joi.number().required()
}
```

### response (on error):
```
{
  "hasError": true,
  "error": {
    code,
    message
  }
}
```
Possible Error Codes:
```
{ code: VALIDATION_ERROR } // validation error on one of the fields
{ code: APIKEY_INVALID } // the api key is invalid
{ code: CUSTOMER_INVALID } // customer does not exist
```

### response (on success):
```
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `customer` collection in db.