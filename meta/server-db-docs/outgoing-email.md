This collection contains record of an email

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  from: Joi.string().min(1).max(15).required(),
  to: Joi.string().min(1).max(15).required(),
  content: Joi.string().min(1).max(512).required(),
  status: Joi.string().valid('pending', 'sent', 'delivered', 'canceled').required(),
  isDeleted: Joi.boolean().required()
});
```