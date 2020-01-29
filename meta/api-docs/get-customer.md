This API handles view customer information request.

url: `api/get-customer`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  customerId: Joi.number().max(999999999999999).required()
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
```

### response (on success):
```js
{
  "hasError": false,
  "customer": Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    fullName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    balance: Joi.number().max(999999999999999).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    isDeleted: Joi.boolean().required(),
    
    additionalPaymentHistory: Joi.array().items(
      Joi.object().keys({
        creditedDatetimeStamp: Joi.number().max(999999999999999).required(),
        acceptedByUserId: Joi.number().max(999999999999999).required(),
        amount: Joi.number().max(999999999999999).required()
      });
    )
  });
}
```

### db changes:
updates No collection in db.