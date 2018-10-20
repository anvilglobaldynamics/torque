This collection contains an service blueprint

## signature
```js
Joi.object().keys({
  
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

  name: Joi.string().min(1).max(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),

  defaultVat: Joi.number().max(999999999999999).required(),
  defaultSalePrice: Joi.number().max(999999999999999).required(),
  
  isLongstanding: Joi.boolean().required(),
  serviceDuration: Joi.object().allow(null).required().keys({
    months: Joi.number().min(0).max(999999999999999).required(),
    days: Joi.number().min(0).max(999999999999999).required(),
  }),

  isEmployeeAssignable: Joi.boolean().required(),
  isCustomerRequired: Joi.boolean().required(),
  isRefundable: Joi.boolean().required(),
  isDeleted: Joi.boolean().required()

});
```