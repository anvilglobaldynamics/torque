This collection contains an product-acquisition

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  isDeleted: Joi.boolean().required(),
  createdByUserId: Joi.number().max(999999999999999).required(),

  acquiredDatetimeStamp: Joi.number().max(999999999999999).required(),
  partyType: Joi.string().valid('unspecified', 'own', 'subsidiary', 'vendor').required(),
  partyName: Joi.string().min(1).max(64).allow(null).required(),

  productList: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().max(999999999999999).required(),
      count: Joi.number().max(999999999999999).required()
    })
  )
});
```