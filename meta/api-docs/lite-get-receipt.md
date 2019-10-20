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
// TODO: 
```

### response (on success):
Signup is successful
```js
{
  "hasError": false,
  // sales, outlet, organization, soldByUser, customer
}
```

### db changes:
None.