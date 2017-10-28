This collection contains an outlet

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  lastModifiedDatetimeStamp: Joi.number().required(),
  name: Joi.string().min(1).max(64).required(),
  organizationId: Joi.number().required(),
  physicalAddress: Joi.string().min(1).max(128).required(),
  contactPersonName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().alphanum().min(11).max(14).required(),
  isDeleted: Joi.boolean().required()
});
```