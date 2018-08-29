This collection contains an organization

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  name: Joi.string().min(1).max(64).required(),
  primaryBusinessAddress: Joi.string().min(1).max(128).required(),
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
  email: Joi.string().email().min(3).max(30).required(),
  packageActivationId: Joi.number().max(999999999999999).required(),
  isDeleted: Joi.boolean().required()
});
```