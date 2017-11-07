This collection contains meta data regarding our application

## signature
```
Joi.object().keys({
  roleList: Joi.array().items(Joi.string().required()),
  privilegeList: Joi.array().items(Joi.string().required())
});
```