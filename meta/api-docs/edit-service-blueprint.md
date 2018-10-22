This API handles attempt to update the service blueprint.

url: `api/edit-service-blueprint`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  serviceBlueprintId: Joi.number().max(999999999999999).required(),
  
  name: Joi.string().min(1).max(64).required(),

  defaultVat: Joi.number().min(0).max(999999999999999).required(),
  defaultSalePrice: Joi.number().min(0).max(999999999999999).required(),
  
  isLongstanding: Joi.boolean().required(),
  serviceDuration: Joi.object().allow(null).required().keys({
    months: Joi.number().min(0).max(999999999999999).required(),
    days: Joi.number().min(0).max(999999999999999).required(),
  }),

  isEmployeeAssignable: Joi.boolean().required(),
  isCustomerRequired: Joi.boolean().required(),
  isRefundable: Joi.boolean().required(),
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
{ code: VAT_VALUE_INVALID } // the vat value is not within 0 to 100
{ code: LONGSTANDING_SETUP_INVALID } // A flag, service duration and customer are required
```

### response (on success):
```js
{
  hasError: false,
  status: "success"
}
```

### db changes:
updates the `service-blueprint` collection in db.