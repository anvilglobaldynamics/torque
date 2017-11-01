This collection contains an organization

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  lastModifiedDatetimeStamp: Joi.number().required(),
  name: Joi.string().min(1).max(64).required(),
  primaryBusinessAddress: Joi.string().min(1).max(128).required(),
  phone: Joi.string().alphanum().min(11).max(14).required(),
  email: Joi.string().email().min(3).max(30).required(),
  licenceExpiresOnDatetimeStamp: Joi.number().required(),
  isDeleted: Joi.boolean().required()
});
```