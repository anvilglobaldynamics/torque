This API handles attempt to delete warehouse.

url: `api/delete-warehouse`

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
{ code: WAREHOUSE_INVALID } // warehouse does not exist
{ code: INVENTORY_NOT_EMPTY } // the inventory contained in this inventory container is not empty
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `warehouse` collection in db.