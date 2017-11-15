This collection contains an product

## signature
```
Joi.object().keys({
  productCategoryId: Joi.number().max(999999999999999).required(),
  purchasePrice: Joi.number().max(999999999999999).required(),
  salePrice: Joi.number().max(999999999999999).required()
});
```