This API handles attempt to activate/deactivate a module on an organization

url: `api/admin-set-module-activation-status`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  moduleCode: Joi.string().required(),
  paymentReference: Joi.string().min(4).max(128).required(),
  action: Joi.string().valid('activate', 'deactivate').required()
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
{ code: ORGANIZATION_INVALID } // no organization found with the given ID
```

### response (on success):
```js
{
  hasError: Joi.boolean().required().equal(false),
  status: Joi.string().required().equal('success')
}
```

### db changes:
updates `organization` and `module-activation` collections.