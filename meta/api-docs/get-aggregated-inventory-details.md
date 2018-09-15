This API handles;
* Get inventory details to populate inventory management view (page 9). Includes the product[] array.
* Also provides array relatedProductList
* Also provides array relatedProductCategoryList

url: `api/get-aggregated-inventory-details`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  inventoryId: Joi.number().max(999999999999999).required(),
  searchString: Joi.string().min(0).max(64).allow('').optional()
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
{ code: INVENTORY_INVALID } // inventory could not be found
```

### response (on success):
```js
{
  hasError: false,

  inventoryDetails: Joi.object().keys({
    inventoryName: Joi.string().min(1).max(64).required()
  }),

  inventoryContainerDetails: Joi.object().keys({
    inventoryContainerType: Joi.string().valid('outlet', 'warehouse').required(),
    inventoryContainerId: Joi.number().max(999999999999999).required(),
    inventoryContainerName: Joi.string().min(1).max(64).required()
  }),

  aggregatedProductList: Joi.array().keys({
    productId: Joi.number().max(999999999999999).required(),
    count: Joi.number().max(999999999999999).required(),
    acquiredDatetimeStamp: Joi.number().max(999999999999999).required(),
    addedDatetimeStamp:  Joi.number().max(999999999999999).required(),

    product: Joi.object().keys({
      id: Joi.number().max(999999999999999).required(),
      productCategoryId: Joi.number().max(999999999999999).required(),
      purchasePrice: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required(),
      
      productCategory: Joi.object().keys({
        id: Joi.number().max(999999999999999).required(),
        createdDatetimeStamp: Joi.number().max(999999999999999).required(),
        lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
        name: Joi.string().min(1).max(64).required(),
        organizationId: Joi.number().max(999999999999999).required(),
        unit: Joi.string().max(1024).required(),
        defaultDiscountType: Joi.string().valid('percent', 'fixed').required(),
        defaultDiscountValue: Joi.number().when(
          'defaultDiscountType', { 
            is: 'percent', 
            then: Joi.number().min(0).max(100).required(), 
            otherwise: Joi.number().max(999999999999999).required() 
          }
        ),
        defaultPurchasePrice: Joi.number().max(999999999999999).required(),
        defaultVat: Joi.number().max(999999999999999).required(),
        defaultSalePrice: Joi.number().max(999999999999999).required(),
        isDeleted: Joi.boolean().required(),
        isReturnable: Joi.boolean().required()
      })
    })
  })
}
```

### db changes:
updates no collection in db.