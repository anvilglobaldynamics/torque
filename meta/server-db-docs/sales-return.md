This collection contains an sales return

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  salesId: Joi.number().required(),
  isDeleted: Joi.boolean().required(),
  returnedProductList: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().required()
      count: Joi.number().required()
    });
  );
  creditedAmount: Joi.number().required()
});
```