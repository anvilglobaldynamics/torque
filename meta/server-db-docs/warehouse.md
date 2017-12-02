This collection contains an warehouse

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  name: Joi.string().min(1).max(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  physicalAddress: Joi.string().min(1).max(128).required(),
  contactPersonName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().alphanum().min(11).max(14).required(),
  isDeleted: Joi.boolean().required()
});
```