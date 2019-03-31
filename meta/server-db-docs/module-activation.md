This collection contains a module-activation

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  deactivatedDatetimeStamp: Joi.number().max(999999999999999).allow(null).required(),
  moduleCode: Joi.string().required(),
  organizationId: Joi.number().max(999999999999999).required(),
  createdByAdminName: Joi.string().min(1).max(64).required(),
  paymentReference: Joi.string().min(4).max(128).required(),
  isDeactivated: Joi.boolean().required()
});
```