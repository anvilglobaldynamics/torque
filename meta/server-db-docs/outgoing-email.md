This collection contains record of an email

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  from: Joi.string().min(5).max(64).required(),
  to: Joi.string().min(5).max(64).required(),
  subject: Joi.string().min(1).max(1024).required(),
  html: Joi.string().min(1).max(65536).required(),
  status: Joi.string().valid('pending', 'sent', 'delivered', 'canceled').required(),
  isDeleted: Joi.boolean().required()
});
```