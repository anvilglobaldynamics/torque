This collection contains an customer

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  lastModifiedDatetimeStamp: Joi.number().required(),
  fullName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().alphanum().min(11).max(14).required(),
  organizationId: Joi.number().required(),
  balance: Joi.number().required(),
  isDeleted: Joi.boolean().required(),
  
  additionalPaymentHistory: Joi.array().items(
    Joi.object().keys({
      creditedDatetimeStamp: Joi.number().required(),
      acceptedByUserId: Joi.number().required(),
      amount: Joi.number().required()
    });
  )
});
```