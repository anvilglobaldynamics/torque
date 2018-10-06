This collection contains an sales return

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  salesId: Joi.number().max(999999999999999).required(),
  isDeleted: Joi.boolean().required(),
  returnedProductList: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().max(999999999999999).required(),
      count: Joi.number().max(999999999999999).required()
    })
  ),

  creditedAmount: Joi.number().max(999999999999999).required(),
  returnableWasSavedInChangeWallet: Joi.boolean().required()
});
```