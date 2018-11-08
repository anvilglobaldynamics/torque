This API handles get active service list in a outlet request.

url: `api/get-active-service-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  outletId: Joi.number().max(999999999999999).required(),
  searchString: Joi.string().min(0).max(64).allow('').optional()
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
{ code: OUTLET_INVALID } // outlet not found
{ code: SERVICE_BLUEPRINT_INVALID }
```

### response (on success):
```js
{
  hasError: false,

  serviceList: Joi.array().min(0).items(
    Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      createdByUserId: Joi.number().max(999999999999999).required(),

      serviceBlueprintId: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().min(0).max(999999999999999).required(),

      serviceBlueprint: Joi.object().keys({
        createdDatetimeStamp: Joi.number().max(999999999999999).required(),
        lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

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
        isDeleted: Joi.boolean().required()
      }),

      outletId: Joi.number().max(999999999999999).required(),
      isAvailable: Joi.boolean().required()
    });
  )
}
```

### db changes:
updates no collection in db.