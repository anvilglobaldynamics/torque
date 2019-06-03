This API handles view warehouse information request.

url: `api/get-warehouse`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  warehouseId: Joi.number().max(999999999999999).required()
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
{ code: WAREHOUSE_INVALID } // warehouse not found
```

### response (on success):
```js
{
  "hasError": false,
  "warehouse": Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    
    name: Joi.string().min(1).max(64).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    physicalAddress: Joi.string().min(1).max(128).required(),
    contactPersonName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required()
  }),
  "defaultInventory": Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    
    id: Joi.number().max(999999999999999).required(),
    name: Joi.string().min(1).max(64).required(),
  }),
  "returnedInventory": Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    
    id: Joi.number().max(999999999999999).required(),
    name: Joi.string().min(1).max(64).required(),
  }),
  "damagedInventory": Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    
    id: Joi.number().max(999999999999999).required(),
    name: Joi.string().min(1).max(64).required(),
  })
}
```

### db changes:
updates No collection in db.