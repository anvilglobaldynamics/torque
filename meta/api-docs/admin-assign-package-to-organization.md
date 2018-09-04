This API handles attempt to add an package to organization.

url: `api/admin-assign-package-to-organization`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  packageCode: Joi.string().required()
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
{ code: ORGANIZATION_INVALID } // the organization id is invalid
{ code: PACKAGE_INVALID } // the package id is invalid
```

### response (on success):
```js
{
  "hasError": false,
  "status": "success",
  "packageActivationId": Joi.number().max(999999999999999).required()
}
```

### db changes:
updates the `organization` and `package-activation` collection in db.