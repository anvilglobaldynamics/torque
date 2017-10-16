This collection contains a user

## signature
```
Joi.object().keys({
  email: Joi.string().email().required().min(3).max(30),
  passwordHash: Joi.string().min(64).max(64).required(),
  isValid: Joi.boolean().required(),
  isBanned: Joi.boolean().required()
});
```