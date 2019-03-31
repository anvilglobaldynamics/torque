This API handles attempt to get a product's information

url: `api/get-product`

method: `POST`

### request: 
```js
{
  inventoryId: Joi.number().max(999999999999999).required(), // this is in req only to varify correct organization
  productId: Joi.number().max(999999999999999).required()
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
{ code: INVENTORY_INVALID } // inventory not found
{ code: PRODUCT_NOT_IN_INVENTORY } // product is not in this inventory
{ code: PRODUCT_INVALID } // product not found
```

### response (on success):
```js
{
  hasError: false,

  product: Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

    productBlueprintId: Joi.number().max(999999999999999).required(),
    purchasePrice: Joi.number().max(999999999999999).required(),
    salePrice: Joi.number().max(999999999999999).required(),
  })
}
```

### db changes:
updates no collection in db.