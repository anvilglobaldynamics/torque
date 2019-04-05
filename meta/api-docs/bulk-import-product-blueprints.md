This API handles adding new product blueprints in bulk.

url: `api/bulk-import-product-blueprints`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  rowList: Joi.array().required().ordered(
    Joi.string().min(1).max(64).required(), // name
    Joi.string().max(1024).required(), // unit
    Joi.number().max(999999999999999).required(), // defaultPurchasePrice
    Joi.number().max(999999999999999).required(), //defaultSalePrice
    Joi.number().max(999999999999999).required(), // defaultVat
    Joi.string().valid('Yes', 'No').required(), // is converted into isReturnable
    Joi.string().max(64).allow('').required() // identifierCode
  )
}
```

### response (on error):
```js
{
  hasError: true,
  error: {
    code,
    message,
    cellNumber // (optional)
    rowNumber // (optional)
  }
}
```

Possible Error Codes:
```js
{ code: VALIDATION_ERROR } // validation error on one of the fields
{ code: APIKEY_INVALID } // the api key is invalid
{ code: ORGANIZATION_INVALID } // the organization id is invalid
{ code: MODIFIED_VALIDATION_ERROR } // special validation errors
```

### response (on success):
```js
{
  hasError: Joi.boolean().required().equal(false),
  status: Joi.string().required().equal('success'),
  ignoredRowList: Joi.array().required().allow([]),
  successfulCount: Joi.number().required()
}
```

### db changes:
updates the `product-blueprint` collection in db.

### notes:
ignoredRowList can contain an array of objects similar to `{
  "reason": "name-duplication",
  "rowNumber": 2
}`

### examples:
```js
rowList: [
  ["Should Be Unique 3", "pc", 300, 500, 10, "percent", 100, "Yes"],
  ["Should Be Unique 2", "haali", 10, 10, 10, "fixed", 0, "No"]
]
```

