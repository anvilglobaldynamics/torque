This collection contains an product-transfer

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  isDeleted: Joi.boolean().required(),
  createdByUserId: Joi.number().max(999999999999999).required(),

  productTransferNumber: Joi.number().max(999999999999999).required(),

  transferredDatetimeStamp: Joi.number().max(999999999999999).required(),
  fromInventoryId: Joi.number().max(999999999999999).required(),
  toInventoryId: Joi.number().max(999999999999999).required(),
  vendorId: Joi.number().max(999999999999999).allow(null).required(),
  organizationId: Joi.number().max(999999999999999).required(),

  isWithinSameInventoryContainer: Joi.boolean().required(),

  productList: Joi.array().min(1).items(
    Joi.object().keys({
      productId: Joi.number().max(999999999999999).required(),
      count: Joi.number().max(999999999999999).required()
    })
  )
});
```