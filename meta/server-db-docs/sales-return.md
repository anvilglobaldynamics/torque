This collection contains an sales return

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  salesId: Joi.number().required(),
  isDeleted: Joi.boolean().required(),
  <!-- TODO: ReturnedProductList -->
  creditedAmount: Joi.number().required()
});
```