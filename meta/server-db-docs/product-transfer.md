This collection contains an product-transfer

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  isDeleted: Joi.boolean().required(),
  createdByUserId: Joi.number().max(999999999999999).required(),

  transferredDatetimeStamp: Joi.number().max(999999999999999).required(),
  fromInventoryId: Joi.number().max(999999999999999).required(),
  toInventoryId: Joi.number().max(999999999999999).required(),

  productList: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().max(999999999999999).required(),
      count: Joi.number().max(999999999999999).required()
    })
  )
});
```