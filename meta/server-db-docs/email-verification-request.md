This collection contains an email-verification-request

## signature
```
Joi.object().keys({
  forEmail: Joi.string().email().required().min(3).max(30),
  forUserId: Joi.number().required(),
  createdDatetimeStamp: Joi.number().required(),
  verifiedDatetimeStamp: Joi.number().required(),
  origin: Joi.string().required(),
  verificationToken: Joi.string().min(64).max(64).required(),
  isVerificationComplete: Joi.boolean().required(),
});
```