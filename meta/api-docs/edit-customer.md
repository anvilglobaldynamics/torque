This API handles attempt to edit customer.

url: `api/edit-customer`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),
  customerId: Joi.number().required(),

  fullName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().alphanum().min(11).max(14).required()
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
{ code: PHONE_ALREADY_IN_USE } // the phone number is already associated
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