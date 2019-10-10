This API handles attempt to edit customer.

url: `api/edit-customer`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  customerId: Joi.number().max(999999999999999).required(),

  fullName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
  email: Joi.string().email().min(3).max(30).allow(null).required(),
  address: Joi.string().min(1).max(128).allow('').required()
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
{ code: PHONE_ALREADY_IN_USE } // the phone number is already associated
{ code: PHONE_REQUIRED } // Phone is required ('torque' only)
{ code: CUSTOMER_EMAIL_OR_PHONE_REQUIRED } // At least phone or email is required
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