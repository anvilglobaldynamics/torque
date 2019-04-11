This API handles getting collection details

url: `api/report-collection-details`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  organizationId: Joi.number().max(999999999999999).required(),
  outletId: Joi.number().max(999999999999999).allow(null).required(),
  customerId: Joi.number().max(999999999999999).allow(null).required(),

  shouldFilterByOutlet: Joi.boolean().required(),
  shouldFilterByCustomer: Joi.boolean().required(),

  paymentMethod: Joi.string().valid('cash', 'card', 'digital', 'change-wallet', null).required(),
  
  fromDate: Joi.number().max(999999999999999).required(),
  toDate: Joi.number().max(999999999999999).required()
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
{ code: OUTLET_INVALID } // outlet could not be found 
{ code: CUSTOMER_INVALID } // customer could not be found
{ code: ORGANIZATION_INVALID } // organization could not be found
```

### response (on success):
```js
{
  "hasError": false,
  "collectionList": Joi.array().items(
    Joi.object().keys({
    salesId: Joi.number().max(999999999999999).required(),
    collectedAmount: Joi.number().max(999999999999999).required(),
    collectedByUserId: Joi.number().max(999999999999999).required(),
    collectedDatetimeStamp: Joi.number().max(999999999999999).required(),
    collectedByUser: Joi.object().keys({
      fullName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
    }),    
    paymentMethod: Joi.string().valid('cash', 'card', 'digital', 'change-wallet').required()
  )
}
```

### db changes:
updates no collection in db.

### NOTE: