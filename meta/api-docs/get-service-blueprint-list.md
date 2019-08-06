This API handles get serrvice blueprints to populate service blueprint view.

url: `api/get-service-blueprint-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  searchString: Joi.string().min(0).max(64).allow('').optional(),
  serviceBlueprintIdList: Joi.array().items(Joi.number()).default([]).optional() // takes precedence over searchString
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
{ code: SERVICE_BLUEPRINT_INVALID } // the service blueprint is invalid

```

### response (on success):
```js
{
  hasError: false,
  
  serviceBlueprintList: Joi.array().items(
    Joi.object().keys({

      id: Joi.number().max(999999999999999).required(),
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    
      organizationId: Joi.number().max(999999999999999).required(),
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
      isDeleted: Joi.boolean().required()

    });
  )
}
```

### db changes:
updates no collection in db.