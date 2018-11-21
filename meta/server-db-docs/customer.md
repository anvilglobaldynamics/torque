This collection contains an customer

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  isDeleted: Joi.boolean().required(),

  fullName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
  email: Joi.string().email().min(3).max(30).allow(null).required(),
  address: Joi.string().min(1).max(128).allow('').required(),

  organizationId: Joi.number().max(999999999999999).required(),
  changeWalletBalance: Joi.number().max(999999999999999).required(),
  
  withdrawalHistory: Joi.array().items(
    Joi.object().keys({
      creditedDatetimeStamp: Joi.number().max(999999999999999).required(),
      byUserId: Joi.number().max(999999999999999).required(),
      amount: Joi.number().max(999999999999999).required()
    });
  )
});
```