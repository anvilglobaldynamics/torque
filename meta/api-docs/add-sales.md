This API handles submission of sale form

url: `api/add-sales`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  outletId: Joi.number().max(999999999999999).required(),
  customerId: Joi.number().max(999999999999999).allow(null).required(),

  productList: Joi.array().min(1).items(
    Joi.object().keys({
      productId: Joi.number().max(999999999999999).required(),
      count: Joi.number().max(999999999999999).required(),
      discountType: Joi.string().max(1024).required(),
      discountValue: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required(),
      vatPercentage: Joi.number().max(999999999999999).required(),
    })
  ),
  
  payment: Joi.object().required().keys({
    totalAmount: Joi.number().max(999999999999999).required(),
    vatAmount: Joi.number().max(999999999999999).required(),
    discountType: Joi.string().valid('percent', 'fixed').required(),
    discountValue: Joi.number().max(999999999999999).required(),
    discountedAmount: Joi.number().max(999999999999999).required(),
    serviceChargeAmount: Joi.number().max(999999999999999).required(),
    totalBilled: Joi.number().max(999999999999999).required(),
    paymentMethod: Joi.string().valid('cash', 'card', 'digital', 'change-wallet').required(),
    paidAmount: Joi.number().max(999999999999999).required(),
    changeAmount: Joi.number().max(999999999999999).required(),
    shouldSaveChangeInAccount: Joi.boolean().required()
  })
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
{ code: OUTLET_INVENTORY_INVALID } // outlet or inventory could not be found 
{ code: CUSTOMER_INVALID } // customer could not be found
{ code: CREDIT_SALE_NOT_ALLOWED_WITHOUT_CUSTOMER }
{ code: PRODUCT_INVALID } // product could not be found
{ code: INSUFFICIENT_PRODUCT } // not enough product in inventory
{ code: BILL_INACCURATE } // Bill is mathematically inaccurate

From "customer-mixin":
  { code: INSUFFICIENT_BALANCE }
  { code: NEGATIVE_AMOUNT_GIVEN }
  { code: UNABLE_TO_UPDATE_CUSTOMER_CHANGE_WALLET_BALANCE }
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success",
  "salesId": Joi.number().max(999999999999999).allow(null).required()
}
```

### db changes:
updates the `sales`, `customer` and `inventory` collection in db.

### notes:
in future we could save draft sale in db.