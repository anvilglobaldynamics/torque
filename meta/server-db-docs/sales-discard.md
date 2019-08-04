This collection contains a sales discard

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  
  salesId: Joi.number().max(999999999999999).required(),
  isDeleted: Joi.boolean().required(),
  returnedProductList: Joi.array().min(0).items( // min(0) because service only sales also generate sales discard records
    Joi.object().keys({
      productId: Joi.number().max(999999999999999).required(),
      count: Joi.number().max(999999999999999).required()
    })
  ),
});
```