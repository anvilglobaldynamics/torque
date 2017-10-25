This collection contains an employment

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  lastModifiedDatetimeStamp: Joi.number().required(),
  userId: Joi.number().required(),
  organizationId: Joi.number().required(),
  designation: Joi.string().required(),
  role: Joi.string().required(),
  companyProvidedId: Joi.string().alphanum().required(),
  <!-- TODO: privileges -->
  isActive: Joi.boolean().required(),
});
```