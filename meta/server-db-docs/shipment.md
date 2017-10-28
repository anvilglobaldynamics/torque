This collection contains an shipment

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  inventoryId: Joi.number().required(),
  productList: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().required(),
      count: Joi.number().required()
    });
  );
});
```