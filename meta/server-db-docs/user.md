This collection contains a user

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  lastModifiedDatetimeStamp: Joi.number().required(),
  fullName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().alphanum().min(11).max(14).required(),
  passwordHash: Joi.string().min(64).max(64).required(),
  email: Joi.string().email().min(3).max(30).required(),
  nid: Joi.string().min(16).max(16).required(),
  physicalAddress: Joi.string().min(1).max(128).required(),
  emergencyContact: Joi.number().min(6).max(11).required(),
  bloodGroup: Joi.alphanum().min(2).max(3).required(),
  isDeleted: Joi.boolean().required(),
  isPhoneVerified: Joi.boolean().required(),
  isEmailVerified: Joi.boolean().required(),
  isBanned: Joi.boolean().required()
});
```