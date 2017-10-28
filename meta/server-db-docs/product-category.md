This collection contains an product category

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  lastModifiedDatetimeStamp: Joi.number().required(),
  name: Joi.string().min(1).max(64).required(),
  organizationId: Joi.number().required(),
  ParentProductCategoryId: Joi.number().required(),
  unit: Joi.string().required(),
  defaultDiscountType: Joi.string().required(),
  defaultDiscountValue: Joi.number().required(),
  defaultPurchasePrice: Joi.number().required(),
  defaultVAT: Joi.number().required(),
  defaultSalePrice: Joi.number().required(),
  isDeleted: Joi.boolean().required(),
  isReturnable: Joi.boolean().required()
});
```