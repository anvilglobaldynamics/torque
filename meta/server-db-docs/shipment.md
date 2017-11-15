This collection contains an shipment

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  inventoryId: Joi.number().max(999999999999999).required(),
  productList: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().max(999999999999999).required(),
      count: Joi.number().max(999999999999999).required()
    });
  );
});
```