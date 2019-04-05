This collection contains a product

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  productBlueprintId: Joi.number().max(999999999999999).required(),
  purchasePrice: Joi.number().max(999999999999999).required(),
  salePrice: Joi.number().max(999999999999999).required()
});
```