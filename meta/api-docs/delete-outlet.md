This API handles attempt to delete outlet.

url: `api/delete-outlet`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  outletId: Joi.number().required()
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
{ code: OUTLET_INVALID } // outlet does not exist
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
updates the `outlet` collection in db.