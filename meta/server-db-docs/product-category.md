This collection contains a product-category

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

  name: Joi.string().min(1).max(64).required(),
  colorCode: Joi.string().length(6).required(),
  organizationId: Joi.number().max(999999999999999).required(),

  isDeleted: Joi.boolean().required()
});
```