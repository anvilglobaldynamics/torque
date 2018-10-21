This API handles adding new service blueprint.

url: `api/add-service-blueprint`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  name: Joi.string().min(1).max(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),

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
  avtivateInAllOutlets: Joi.boolean().required()
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
{ code: ORGANIZATION_INVALID } // the organization id is invalid
{ code: VAT_VALUE_INVALID } // the vat value is not within 0 to 100
{ code: LONGSTANDING_SETUP_INVALID } // A flag and service duration is required
{ code: GENERIC_ACTIVATION_ERROR } // Error occurred while activating
```

### response (on success):
```js
{
  hasError: false,
  status: "success",
  serviceBlueprintId: Joi.number().max(999999999999999).required()
}
```

### db changes:
updates the `service-blueprint` collection in db.