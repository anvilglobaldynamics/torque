This collection contains an package-activation

## signature
```js
Joi.object().keys({

  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  packageCode: Joi.string().required(),
  organizationId: Joi.number().max(999999999999999).required(),
  createdByAdminName: Joi.string().min(1).max(64).required(),
  isDiscarded: Joi.boolean().required()

});
```