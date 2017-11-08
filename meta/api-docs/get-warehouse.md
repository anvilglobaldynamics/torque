This API handles view warehouse information request.

url: `api/get-warehouse`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),
  warehouseId: Joi.number().required()
}
```

### response (on error):
```
{
  "hasError": true,
  "error": {
    code,
    message
  }
}
```
Possible Error Codes:
```
{ code: VALIDATION_ERROR } // validation error on one of the fields
{ code: APIKEY_INVALID } // the api key is invalid
{ code: WAREHOUSE_INVALID } // warehouse not found
```

### response (on success):
```
{
  "hasError": false,
  "warehouse": Joi.object().keys({
    createdDatetimeStamp: Joi.number().required(),
    lastModifiedDatetimeStamp: Joi.number().required(),
    
    name: Joi.string().min(1).max(64).required(),
    organizationId: Joi.number().required(),
    physicalAddress: Joi.string().min(1).max(128).required(),
    contactPersonName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().alphanum().min(11).max(14).required()
  });
}
```

### db changes:
updates No collection in db.