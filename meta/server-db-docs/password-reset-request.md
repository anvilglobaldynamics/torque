This collection contains a password-reset-request

## signature
```
Joi.object().keys({
  forUserId: Joi.number().max(999999999999999).required(),
  forEmail: Joi.string().email().min(3).max(30), 
  forPhone: Joi.string().alphanum().min(11).max(14),
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  confirmedDatetimeStamp: Joi.number().max(999999999999999).required(),
  origin: Joi.string().max(1024).required(),
  confirmationToken: Joi.string().min(64).max(64).required(),
  isPasswordResetComplete: Joi.boolean().required(),
});
```