This API handles attempt to delete a customer

url: `api/delete-customer`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),
  customerId: Joi.number().required()
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
{ code: CUSTOMER_INVALID } // customer does not exist
<!-- TODO: delete all customer? -->
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