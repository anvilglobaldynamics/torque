This API handles get the list of sales return to populate sales return lists request.

url: `api/get-sales-return-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  organizationId: Joi.number().required(),
  outletId: Joi.number().required(),
  customerId: Joi.number().required(),
  
  fromDate: Joi.number().required(),
  toDate: Joi.number().required()
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

  "salesReturnList": Joi.array().items(
    Joi.object().keys({
      salesReturnId: Joi.number().required(),
      salesId: Joi.number().required(),
      isDeleted: Joi.boolean().required(),
      returnedProductList: Joi.array().items(
        Joi.object().keys({
          productId: Joi.number().required(),
          count: Joi.number().required()
        });
      );
      creditedAmount: Joi.number().required()
    });
  )
}
```

### db changes:
updates no collection in db.