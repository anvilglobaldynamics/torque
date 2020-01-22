This API handles view outlet information request.

url: `api/get-outlet`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  outletId: Joi.number().max(999999999999999).required()
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
{ code: OUTLET_INVALID } // outlet not found or deleted
```

### response (on success):
```js
{
  "hasError": false,

  "outlet": Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    name: Joi.string().min(1).max(64).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    physicalAddress: Joi.string().min(1).max(128).required(),
    contactPersonName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).required(),

    location: Joi.object().keys({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required(),
    categoryCode: Joi.string().required(),

    isDeleted: Joi.boolean().required()
  }),

  "defaultInventory": Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    
    id: Joi.number().max(999999999999999).required(),
    name: Joi.string().min(1).max(64).required(),
  }),

  "returnedInventory": Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    
    id: Joi.number().max(999999999999999).required(),
    name: Joi.string().min(1).max(64).required(),
  }),
  
  "damagedInventory": Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    
    id: Joi.number().max(999999999999999).required(),
    name: Joi.string().min(1).max(64).required(),
  })
}
```

### db changes:
updates No collection in db.