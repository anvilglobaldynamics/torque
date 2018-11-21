This collection contains an outlet

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  name: Joi.string().min(1).max(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  physicalAddress: Joi.string().min(1).max(128).required(),
  contactPersonName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
  location: Joi.object().keys({
    lat: Joi.number().required(),
    lng: Joi.number().required()
  }).required(),
  isDeleted: Joi.boolean().required()
});
```