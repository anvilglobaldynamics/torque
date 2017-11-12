This API handles attempt to edit warehouse’s information

url: `api/edit-warehouse`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  warehouseId: Joi.number().required(),

  name: Joi.string().min(1).max(64).required(),
  physicalAddress: Joi.string().min(1).max(128).required(),
  contactPersonName: Joi.string().min(1).max(64).required(),
  phone: Joi.string().alphanum().min(11).max(14).required()
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
{ code: PHONE_ALREADY_IN_USE } // the phone number is already associated with another organization
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

### notes:
* same phone number can be used within same organization