This collection contains an product blueprint

## signature
```js
Joi.object().keys({
  
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

  name: Joi.string().min(1).max(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  unit: Joi.string().max(64).required(),
  identifierCode: Joi.string().max(64).allow('').required(),
  defaultPurchasePrice: Joi.number().max(999999999999999).required(),
  defaultVat: Joi.number().max(999999999999999).required(),
  defaultSalePrice: Joi.number().max(999999999999999).required(),
  productCategoryIdList: Joi.array().items(Joi.number()).required(),
  
  isDeleted: Joi.boolean().required(),
  isReturnable: Joi.boolean().required()

});
```