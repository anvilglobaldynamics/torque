This API handles the list of organizations to populate master container organization change selection.

url: `api/get-organization-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required()
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
```

### response (on success):
```js
{
  "hasError": false,
  "organizationList": Joi.array().items(
    Joi.object().keys({
      name: Joi.string().min(1).max(64).required(),
      primaryBusinessAddress: Joi.string().min(1).max(128).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
      email: Joi.string().email().min(3).max(30).required(),
      employment: Joi.object().keys({ 
        designation: Joi.string().max(64).required(), 
        role: Joi.string().max(64).required(), 
        companyProvidedId: Joi.string().allow('').max(64).required(), 
        isActive: Joi.boolean().required()
        privileges: Joi.object().required()
      }),
      settings: Joi.object().keys({
        receiptText1: Joi.string().min(0).max(64).allow('').required(),
        receiptText2: Joi.string().min(0).max(64).allow('').required(),
        logoImageId: Joi.number().max(999999999999999).allow(null).required(),
      }),
      activeModuleCodeList: Joi.array().items(
        Joi.string().required()
      ).required()
    });
  )
}
```

### db changes:
updates no collection in db.