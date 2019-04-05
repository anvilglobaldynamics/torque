This collection contains a session

## signature
```js
Joi.object().keys({
  userId: Joi.number().max(999999999999999).required(),
  apiKey: Joi.string().length(64).required(),
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  terminatedDatetimeStamp: Joi.number().max(999999999999999).required().allow(null),
  terminatedBy: Joi.string().allow('').max(64).required(),
  hasExpried: Joi.boolean().required()
});
```