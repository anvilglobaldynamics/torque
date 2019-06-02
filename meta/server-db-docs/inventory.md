This collection contains an inventory

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  inventoryContainerId: Joi.number().max(999999999999999).required(),
  inventoryContainerType: Joi.string().valid('outlet', 'warehouse').required(),
  type: Joi.string().valid('default', 'returned', 'damaged').required(),
  name: Joi.string().min(1).max(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  productList: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().max(999999999999999).required(),
      count: Joi.number().max(999999999999999).required()
    })
  ),
  isDeleted: Joi.boolean().required()
});
```