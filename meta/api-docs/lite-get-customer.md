This API handles getting the list of torque lite customers

url: `api/lite-get-customer`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).allow(null).required(),
  email: Joi.string().email().min(3).max(30).allow(null).required()
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
  hasError: false,

  customer: Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    fullName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    isDeleted: Joi.boolean().required(),    
  });
  
}
```

### db changes:
updates no collection in db.