This collection contains an organization-settings

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  receiptText1: Joi.string().min(0).max(64).allow('').required(),
  receiptText2: Joi.string().min(0).max(64).allow('').required(),
  logoImageId: Joi.number().max(999999999999999).allow(null).required(),
  isDeleted: Joi.boolean().required()
});
```