This API handles get the list of sales to populate sales lists request.

url: `api/get-sales-list`

method: `POST`

### request: 
```
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
{ code: OUTLET_INVALID } // outlet could not be found 
{ code: CUSTOMER_INVALID } // customer could not be found
{ code: ORGANIZATION_INVALID } // organization could not be found
```

### response (on success):
```
{
  "hasError": false,

  "salesList": Joi.array().items(
    Joi.object().keys({
      salesId: Joi.number().required(),
      createdDatetimeStamp: Joi.number().required(),
      lastModifiedDatetimeStamp: Joi.number().required(),
      lastModifiedByUserId: Joi.number().required(),
      outletId: Joi.number().required(),
      customerId: Joi.number().required(),
      productList: Joi.array().items(
        Joi.object().keys({
          productId: Joi.number().required(),
          count: Joi.number().required(),
          discountType: Joi.string().required(),
          discountValue: Joi.number().required(),
          salePrice: Joi.number().required()
        });
      );
      payment: Joi.object().keys({
        totalAmount: Joi.number().required(),
        vatAmount: Joi.number().required(),
        discountType: Joi.string().required(),
        discountValue: Joi.number().required(),
        discountedAmount: Joi.number().required(),
        serviceChargeAmount: Joi.number().required(),
        totalBilled: Joi.number().required(),
        previousCustomerBalance: Joi.number().required(),
        paidAmount: Joi.number().required(),
        changeAmount: Joi.number().required()
      });
      isModified: Joi.boolean().required(),
    });
  )
}
```

### db changes:
updates no collection in db.