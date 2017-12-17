This API handles get the list of sales to populate sales lists request.

url: `api/get-sales-list`

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

  "salesList": Joi.array().items(
    Joi.object().keys({
      salesId: Joi.number().max(999999999999999).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedByUserId: Joi.number().max(999999999999999).required(),
      outletId: Joi.number().max(999999999999999).required(),
      customerId: Joi.number().max(999999999999999).required(),
      productList: Joi.array().items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
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
        previousCustomerBalance: Joi.number().max(999999999999999).required(),
        paidAmount: Joi.number().max(999999999999999).required(),
        changeAmount: Joi.number().max(999999999999999).required()
      }),
      isModified: Joi.boolean().required()
    });
  )
}
```

### db changes:
updates no collection in db.