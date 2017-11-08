This API handles view customer information request.

url: `api/get-customer`

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
{ code: APIKEY_INVALID } // the api key is invalid
{ code: CUSTOMER_INVALID } // customer does not exist
```

### response (on success):
```
{
  "hasError": false,
  "customer": Joi.object().keys({
    createdDatetimeStamp: Joi.number().required(),
    lastModifiedDatetimeStamp: Joi.number().required(),

    fullName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().alphanum().min(11).max(14).required(),
    organizationId: Joi.number().required(),
    balance: Joi.number().required(),
    organizationId: Joi.number().required(),
    
    additionalPaymentHistory: Joi.object().keys({
      creditedDatetimeStamp: Joi.number().required(),
      acceptedByUserId: Joi.number().required(),
      amount: Joi.number().required()
    });
  });
}
```

### db changes:
updates No collection in db.