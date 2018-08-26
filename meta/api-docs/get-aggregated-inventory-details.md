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
{ code: INVENTORY_INVALID } // inventory could not be found
```

<!-- FIXME: below response is incorrect -->
### response (on success):
```js
{
  "hasError": false,

  "inventoryDetails": Joi.object().keys({
    inventoryName: Joi.string().min(1).max(64).required()
  }),

  "inventoryContainerDetails": Joi.object().keys({
    inventoryContainerType: Joi.string().valid('outlet', 'warehouse').required(),
    inventoryContainerId: Joi.number().max(999999999999999).required()
  }),

  "productList": Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().max(999999999999999).required(),
      count: Joi.number().max(999999999999999).required()
    });
  ),

  "matchingProductList": Joi.array().items(
    Joi.object().keys({
      id: Joi.number().max(999999999999999).required(),
      productCategoryId: Joi.number().max(999999999999999).required(),
      purchasePrice: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required()
    });
  ),

  "matchingProductCategoryList": Joi.array().items(
    Joi.object().keys({
      id: Joi.number().max(999999999999999).required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().max(999999999999999).required(),
      parentProductCategoryId: Joi.number().max(999999999999999).required(),
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
    });
  )
}
```

### db changes:
updates no collection in db.