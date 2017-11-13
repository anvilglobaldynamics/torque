This collection contains a session

## signature
```
Joi.object().keys({
  userId: Joi.number().max(999999999999999).required(),
  apiKey: Joi.string().length(64).required(),
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  terminatedDatetimeStamp: Joi.number().max(999999999999999).required(),
  terminatedBy: Joi.string().required(),
  hasExpried: Joi.boolean().required()
});
```