This API handles get organization’s vendor list request.

url: `api/get-vendor-list`

method: `POST`

### request: 
```js
{
  organizationId: Joi.number().max(999999999999999).required(),
  searchString: Joi.string().min(0).max(32).allow('').optional(),
  vendorIdList: Joi.array().items(Joi.number()).default([]).optional() // takes precedence over searchString
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
{ code: VENDOR_INVALID } // the product category id is invalid
```

### response (on success):
```js
{
  "hasError": false,
  "vendorList": Joi.array().items(
    Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      name: Joi.string().min(1).max(64).required(),
      contactPersonName: Joi.string().min(1).max(64).required(),
      phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
      physicalAddress: Joi.string().min(1).max(128).required(),

      organizationId: Joi.number().max(999999999999999).required(),
      isDeleted: Joi.boolean().required()
    });
  )
}
```

### db changes:
updates no collection in db.