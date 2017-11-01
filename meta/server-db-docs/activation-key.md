This collection contains activation keys

## signature
```
Joi.object().keys({
  keyString: Joi.string().required(),
  isUsed: Joi.boolean().required(),
  generatedBy: Joi.string().required(),
  daysWorth: Joi.number().required(),
  createdDatetimeStamp: Joi.number().required(),
  usedByOrganizationId: Joi.number().required(),
  usedDatetimeStamp: Joi.number().required(),
});
```