This collection contains an product blueprint

## signature
```js
Joi.object().keys({
  
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

  name: Joi.string().min(1).max(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  unit: Joi.string().max(64).required(),
  defaultDiscountType: Joi.string().valid('percent', 'fixed').required(),
  defaultDiscountValue: Joi.number().when(
    'defaultDiscountType', { 
      is: 'percent', 
      then: Joi.number().min(0).max(100).required(), 
      otherwise: Joi.number().max(999999999999999).required() 
    }
  ),
  defaultPurchasePrice: Joi.number().max(999999999999999).required(),
  defaultVat: Joi.number().max(999999999999999).required(),
  defaultSalePrice: Joi.number().max(999999999999999).required(),
  
  isDeleted: Joi.boolean().required(),
  isReturnable: Joi.boolean().required()

});
```