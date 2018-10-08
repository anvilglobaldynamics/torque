This API handles adding of additional payment against a sale

url: `api/add-additional-payment`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  salesId: Joi.number().max(999999999999999).required(),
  customerId: Joi.number().max(999999999999999).required(),
  payment: Joi.object().keys({
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
{ code: CUSTOMER_INVALID } // customer could not be found
{ code: SALES_INVALID } // sale could not be found
{ code: INCORRECT_PAYMENT_CALCULATION } // payment calculation is incorrect

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
updates the `sales` and `customer` collection in db.


