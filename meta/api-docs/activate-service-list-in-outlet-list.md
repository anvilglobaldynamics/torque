This API handles attempt to activate a list of service blueprints in all outlets of a outlet list.

url: `api/activate-service-list-in-outlet-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),

  activateAllServices: Joi.boolean().required(),
  serviceBlueprintList: Joi.array().min(0).items(
    Joi.object().keys({
      serviceBlueprintId: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().min(0).max(999999999999999).required()
    });
  ),

  activateInAllOutlets: Joi.boolean().required(),
  outletIdList: Joi.array().min(0).items(
    joi.number().max(999999999999999).required()
  )
}
```

### response (on error):
```js
{
  hasError: true,
  error: {
    code,
    message
  }
}
```

Possible Error Codes:
```js
{ code: VALIDATION_ERROR } // validation error on one of the fields
{ code: APIKEY_INVALID } // the api key is invalid
{ code: SERVICE_BLUEPRINT_INVALID } // service blueprint not found
{ code: OUTLET_INVALID } // outlet not found
{ code: PREDETERMINER_SETUP_INVALID } // lists referred by true flag should be empty
{ code: GENERIC_ACTIVATION_ERROR } // Error occurred while activating
```

### response (on success):
```js
{
  hasError: false,
  status: "success"
}
```

### db changes:
updates the `service` collection in db.