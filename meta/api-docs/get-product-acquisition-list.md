
This API handles get the list of product acquisition to populate product acquisition lists request.

url: `api/get-product-acquisition-list`

method: `POST`

### request: 
```js
{
  organizationId: Joi.number().max(999999999999999).required(),

  fromDate: Joi.number().max(999999999999999).required(),
  toDate: Joi.number().max(999999999999999).required(),
  vendorId: Joi.number().max(999999999999999).required(),

  searchString: Joi.string().min(0).max(64).allow('').optional() // NOTE: searchString is currently used for productAcquisitionNumber. We can extend it for other purposes later
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
{ code: ORGANIZATION_INVALID } // organization could not be found
{ code: VENDOR_INVALID } // vendor could not be found
```

### response (on success, without includeExtendedInformation):
```js
{
  "hasError": false,
  productTransferList: Joi.array().required().items({

    id: Joi.number().required(),
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    isDeleted: Joi.boolean().required(),
    createdByUserId: Joi.number().max(999999999999999).required(),

    productAcquisitionNumber: Joi.number().max(999999999999999).required(),

    acquiredDatetimeStamp: Joi.number().max(999999999999999).required(),
    inventoryId: Joi.number().max(999999999999999).required(),
    vendorId: Joi.number().max(999999999999999).allow(null).required(),
    organizationId: Joi.number().max(999999999999999).required(),

    productList: Joi.array().min(1).items(
      Joi.object().keys({
        productId: Joi.number().max(999999999999999).required(),
        product: Joi.object().required(), // willingly not expanded
        productBlueprint: Joi.object().required(), // willingly not expanded
        count: Joi.number().max(999999999999999).required()
      })
    ),

    createdByUser: Joi.object().required(), // willingly not expanded
    inventory: Joi.object().required(), // willingly not expanded
    vendor: Joi.object().allow(null).required() // willingly not expanded
  
  })
}
```

### db changes:
updates no collection in db.

### NOTE:
if `searchString` is present and it is a number, other filters are ignored.
