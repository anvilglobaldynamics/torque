This API handles attempt to list organization's activated packages.

url: `api/admin-list-organization-packages`

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
{ code: ORGANIZATION_DOES_NOT_EXIST } // the organization id is invalid
```

### response (on success):
```js
{
  hasError: false,

  packageActivationList: Joi.array().items(

    Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      packageCode: Joi.string()required(),
      organizationId: Joi.number().max(999999999999999).required(),
      isDiscarded: Joi.boolean().required(),

      packageDetail: Joi.object().required().keys({
        // TODO: to be finalized
      })
    });
    
  )
}
```

### db changes:
updates no collection in db.