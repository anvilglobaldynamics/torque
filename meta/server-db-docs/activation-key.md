This collection contains activation keys

## signature
```js
Joi.object().keys({
  keyString: Joi.string().max(1024).required(),
  isUsed: Joi.boolean().required(),
  generatedBy: Joi.string().max(1024).required(),
  daysWorth: Joi.number().max(999999999999999).required(),
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  usedByOrganizationId: Joi.number().max(999999999999999).required(),
  usedDatetimeStamp: Joi.number().max(999999999999999).required()
});
```