This collection contains an inventory

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  lastModifiedDatetimeStamp: Joi.number().required(),
  inventoryContainerId: Joi.number().required(),
  name: Joi.string().min(1).max(64).required(),
  organizationId: Joi.number().required(),
  allowManualTransfer: Joi.boolean().required(),
  <!-- TODO: Products -->
  isDeleted: Joi.boolean().required()
});
```