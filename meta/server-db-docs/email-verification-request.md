This collection contains an email-verification-request

## signature
```
Joi.object().keys({
  forEmail: Joi.string().email().required().min(3).max(30),
  forUserId: Joi.number().max(999999999999999).required(),
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  verifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  origin: Joi.string().max(1024).required(),
  verificationToken: Joi.string().min(64).max(64).required(),
  isVerificationComplete: Joi.boolean().required(),
});
```