This collection contains an transfer

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  createdByUserId: Joi.number().required(),
  fromInventoryId: Joi.number().required(),
  toInventoryId: Joi.number().required(),
  productList: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().required(),
      count: Joi.number().required()
    });
  );
});
```