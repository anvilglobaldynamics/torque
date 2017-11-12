This API handles get a sales return request.

url: `api/get-sales-return`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  salesReturnId:  Joi.number().required()
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
{ code: SALES_RETURN_INVALID } // sales could not be found

```

### response (on success):
```js
{
  "hasError": false,

  "salesReturn": Joi.object().keys({
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
}
```

### db changes:
updates no collection in db.