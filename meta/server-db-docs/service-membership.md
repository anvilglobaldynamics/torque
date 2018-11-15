This collection contains a service membership

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  createdByUserId: Joi.number().max(999999999999999).required(),

  customerId: Joi.number().max(999999999999999).required(),
  salesId: Joi.number().max(999999999999999).required(),
  serviceId: Joi.number().max(999999999999999).required(),
  assignedEmploymentId: Joi.number().max(999999999999999).allow(null).required(),

  expiringDatetimeStamp: Joi.number().max(999999999999999).required(),

  isDiscarded: Joi.boolean().required(),
  discardReason: Joi.string().allow('').max(128).required(),
  isDeleted: Joi.boolean().required()
});
```