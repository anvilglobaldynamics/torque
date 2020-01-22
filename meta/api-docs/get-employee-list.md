This API handles get organization’s employee list request.

url: `api/get-employee-list`

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
```

### response (on success):
```js
{
  "hasError": false,
  "employeeList": Joi.array().items(
    Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      userId: Joi.number().max(999999999999999).required(),
      userDetails: Joi.object().required().keys({
        fullName: Joi.string().min(1).max(64).required(),
        phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
        email: Joi.string().email().min(3).max(30).allow(null).required(),
        nid: Joi.string().min(16).max(16).allow('').required(),
        physicalAddress: Joi.string().min(1).max(128).allow('').required(),
        emergencyContact: Joi.string().min(1).max(128).allow('').required(),
        bloodGroup: Joi.string().alphanum().min(2).max(3).allow('').required()
      }),

      organizationId: Joi.number().max(999999999999999).required(),
      designation: Joi.string().max(64).required(),
      role: Joi.string().max(64).required(),
      companyProvidedId: Joi.string().allow('').max(64).required(),
      privileges: Joi.object().required().keys({
        [Look up privileges here](../server-db-docs/employment.js)
      }),
      isActive: Joi.boolean().required()
    });
  )
}
```

### db changes:
updates no collection in db.