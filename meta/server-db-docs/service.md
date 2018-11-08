This collection contains a service

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  createdByUserId: Joi.number().max(999999999999999).required(),

  serviceBlueprintId: Joi.number().max(999999999999999).required(),
  outletId: Joi.number().max(999999999999999).required(),
  
  salePrice: Joi.number().min(0).max(999999999999999).required(),
  isAvailable: Joi.boolean().required()
});
```