This collection contains activation keys

## signature
```
Joi.object().keys({
  keyString: Joi.string().required(),
  isUsed: Joi.boolean().required(),
  generatedBy: Joi.string().required(),
  daysWorth: Joi.number().max(999999999999999).required(),
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  usedByOrganizationId: Joi.number().max(999999999999999).required(),
  usedDatetimeStamp: Joi.number().max(999999999999999).required(),
});
```