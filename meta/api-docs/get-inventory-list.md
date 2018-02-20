This API handles get organization’s inventory list request.

url: `api/get-inventory-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required()
}
```

### response (on error):
```js
{
  "hasError": true,
  "error": {
    code,
    message
  }
}
```

Possible Error Codes:
```js
{ code: VALIDATION_ERROR } // validation error on one of the fields
{ code: APIKEY_INVALID } // the api key is invalid
{ code: ORGANIZATION_INVALID } // the organization id is invalid
```

### response (on success):
```js
{
  "hasError": false,
  "inventoryList": Joi.array().items(
    Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      inventoryContainerId: Joi.number().max(999999999999999).required(),
      inventoryContainerType: Joi.string().valid('outlet', 'warehouse').required(),
      type: Joi.string().valid('default', 'returned', 'damaged').required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      allowManualTransfer: Joi.boolean().required(),
      productList: Joi.array().items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required()
        })
      ),
      isDeleted: Joi.boolean().required()
    });
  )
}
```

### db changes:
updates no collection in db.