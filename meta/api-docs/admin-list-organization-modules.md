This API handles attempt to list organization's activated modules.

url: `api/admin-list-organization-modules`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required()
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
```

### response (on success):
```js
{
  hasError: Joi.boolean().required().equal(false),
  moduleActivationList: Joi.array().items(Joi.object().keys({
    id: Joi.number().optional(),
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    deactivatedDatetimeStamp: Joi.number().max(999999999999999).allow(null).required(),
    moduleCode: Joi.string().required(),
    organizationId: Joi.number().max(999999999999999).required(),
    createdByAdminName: Joi.string().min(1).max(64).required(),
    paymentReference: Joi.string().min(4).max(128).required(),
    isDeactivated: Joi.boolean().required()
  })).required()
}
```

### db changes:
updates no collection in db.