This collection contains an customer

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  lastModifiedDatetimeStamp: Joi.number().required(),
  fullname: Joi.string().min(1).max(64).required(),
  phone: Joi.string().alphanum().min(11).max(14).required(),
  balance: Joi.number().required(),
  isDeleted: Joi.boolean().required(),
  additionalPaymentHistory: Joi.object().keys({
    creditedDatetimeStamp: Joi.number().required(),
    acceptedByUserId: Joi.number().required(),
    amount: Joi.number().required()
  });
});
```