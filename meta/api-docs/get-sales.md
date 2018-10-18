This API handles get a sales request.

url: `api/get-sales`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  salesId:  Joi.number().max(999999999999999).required()
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
{ code: SALES_INVALID } // sales could not be found

```

### response (on success):
```js
{
  "hasError": false,

  "sales": Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedByUserId: Joi.number().max(999999999999999).allow(null).required(),
    outletId: Joi.number().max(999999999999999).required(),
    customerId: Joi.number().max(999999999999999).required(),
    productList: Joi.array().items(
      Joi.object().keys({
        productId: Joi.number().max(999999999999999).required(),
        productBlueprintId: Joi.number().max(999999999999999).required(),
        productBlueprintName: Joi.string().min(1).max(64).required(),
        productBlueprintUnit: Joi.string().max(64).required(),
        productBlueprintIsReturnable: Joi.boolean().required(),
        count: Joi.number().max(999999999999999).required(),
        discountType: Joi.string().max(1024).required(),
        discountValue: Joi.number().max(999999999999999).required(),
        salePrice: Joi.number().max(999999999999999).required()
      })
    ),
    payment: Joi.object().keys({
      totalAmount: Joi.number().max(999999999999999).required(),
      vatAmount: Joi.number().max(999999999999999).required(),
      discountType: Joi.string().max(1024).required(),
      discountValue: Joi.number().max(999999999999999).required(),
      discountedAmount: Joi.number().max(999999999999999).required(),
      serviceChargeAmount: Joi.number().max(999999999999999).required(),
      totalBilled: Joi.number().max(999999999999999).required(),
      paidAmount: Joi.number().max(999999999999999).required(),
      changeAmount: Joi.number().max(999999999999999).required()
    }),
    isModified: Joi.boolean().required()
  });
}
```

### db changes:
updates no collection in db.