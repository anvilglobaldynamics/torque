This collection contains a session

## signature
```
Joi.object().keys({
  userId: Joi.number().required(),
  apiKey: Joi.string().length(64).required(),
  createdDatetimeStamp: Joi.number().required(),
  closedDatetimeStamp: Joi.number().required().allow(null),
  hasExpried: Joi.boolean().required()
});
```