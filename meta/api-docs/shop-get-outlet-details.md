This public api lists outlet details

url: `api/shop-get-outlet-details`

method: `POST`

### request: 
```js
Joi.object().keys({
  outletId: Joi.number().max(999999999999999).required()
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
{ code: OUTLET_INVALID } // outlet not found or deleted
```

### response (on success):
```js
Joi.object().keys({
  hasError: Joi.boolean().required().equal(false),
  outletDeatils: Joi.object().keys({
    name: Joi.string().min(1).max(64).required(),
    physicalAddress: Joi.string().min(1).max(128).required(),
    contactPersonName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
    categoryCode: Joi.string().required()
  }).required(),
  organizationDetails: Joi.object().keys({
    name: Joi.string().min(1).max(64).required(),
    primaryBusinessAddress: Joi.string().min(1).max(128).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
    email: Joi.string().email().min(3).max(30).required()
  }).required(),
  otherOutletList: Joi.array().items(
    Joi.object().keys({
      name: Joi.string().min(1).max(64).required(),
      categoryCode: Joi.string().required(),
      id: Joi.number().max(999999999999999).required()
    })
  ),
  outletProductList: Joi.array().items(
    Joi.object().keys({
      productBlueprintName: Joi.string().min(1).max(64).required(),
      salePrice: Joi.number().max(999999999999999).required()
    })
  ),
  outletServiceList: Joi.array().items(
    Joi.object().keys({
      serviceBlueprintName: Joi.string().min(1).max(64).required(),
      salePrice: Joi.number().min(0).max(999999999999999).required()
    })
  )
});
```

### db changes:
updates No collection in db.