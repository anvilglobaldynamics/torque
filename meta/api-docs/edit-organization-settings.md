This api is used to update organization settings

url: `api/edit-organization-settings`

method: `POST`

### request: 
```js
Joi.object().keys({
  organizationId: Joi.number().max(999999999999999).required(),
  receiptText1: Joi.string().min(0).max(64).allow('').required(),
  receiptText2: Joi.string().min(0).max(64).allow('').required(),
  logoImageId: Joi.number().max(999999999999999).allow(null).required(),
});
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
{ code: ORGANIZATION_INVALID } // the specified organization is invalid
```

### response (on success):
```js
{
  "hasError": false,
  status: "success"
}
```

### db changes:
updates `organization-settings` in db.