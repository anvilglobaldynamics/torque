This collection contains meta data regarding our application

## signature
```
Joi.object().keys({
  roleList: Joi.array().items(Joi.string().max(1024).required()),
  privilegeList: Joi.array().items(Joi.string().max(1024).required()),
  designationList: Joi.array().items(Joi.string().max(1024).required())
});
```