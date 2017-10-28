This collection contains a session

## signature
```
Joi.object().keys({
  userId: Joi.number().required(),
  apiKey: Joi.string().length(64).required(),
  createdDatetimeStamp: Joi.number().required(),
  terminatedDatetimeStamp: Joi.number().required(),
  terminatedBy: Joi.string().required(),
  hasExpried: Joi.boolean().required()
});
```