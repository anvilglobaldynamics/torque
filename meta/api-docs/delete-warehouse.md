This API handles attempt to delete warehouse.

url: `api/delete-warehouse`

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
{ code: WAREHOUSE_INVALID } // warehouse does not exist
{ code: INVENTORY_NOT_EMPTY } // the inventory contained in this inventory container is not empty
```

### response (on success):
```
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `warehouse` collection in db.