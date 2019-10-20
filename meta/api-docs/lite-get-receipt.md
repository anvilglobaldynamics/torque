This API handles receipt retrieval from torque lite.

url: `api/lite-get-receipt`

method: `POST`

### request: 
```js
{
  receiptToken: Joi.string().length(5).required()
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
{ code: RECEIPT_INVALID }
{ code: VALIDATION_ERROR } // validation error on one of the fields
{ code: APIKEY_INVALID } // the api key is invalid
{ code: SALES_INVALID } // sales could not be found
```

### response (on success):
Signup is successful
```js
{
  "hasError": false,
  sales, // See get-sales api response
  outlet, // see outlet.js
  organization, // see organization.js
  soldByUser: {
    fullName: Joi.string().min(1).max(64).required(),
  },
  customer: // see customer.js
}
```

### db changes:
None.