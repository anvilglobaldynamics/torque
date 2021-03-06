This API handles getting the list of customers

url: `api/get-customer-summary-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  searchString: Joi.string().min(0).max(64).allow('').optional()
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
{ code: ORGANIZATION_INVALID } // the organization id is invalid
```

### response (on success):
```js
{
  hasError: false,

  customerList: Joi.array().items(
    Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      changeWalletBalance: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required(),
      
      withdrawalHistory: Joi.array().items(
        Joi.object().keys({
          creditedDatetimeStamp: Joi.number().max(999999999999999).required(),
          byUserId: Joi.number().max(999999999999999).required(),
          amount: Joi.number().max(999999999999999).required()
        })
      )
    });
  )
  
}
```

### db changes:
updates no collection in db.