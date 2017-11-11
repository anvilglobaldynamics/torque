This API handles getting the list of customers

url: `api/get-customer-summary-list`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().required()
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
{ code: ORGANIZATION_INVALID } // the organization id is invalid
```

### response (on success):
```
{
  "hasError": false,
  "customerList": Joi.array().items(
    Joi.object().keys({
      createdDatetimeStamp: Joi.number().required(),
      lastModifiedDatetimeStamp: Joi.number().required(),
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().alphanum().min(11).max(14).required(),
      balance: Joi.number().required(),
      
      additionalPaymentHistory: Joi.array().items(
        Joi.object().keys({
          creditedDatetimeStamp: Joi.number().required(),
          acceptedByUserId: Joi.number().required(),
          amount: Joi.number().required()
        });
      )
    })
  )
}
```

### db changes:
updates no collection in db.