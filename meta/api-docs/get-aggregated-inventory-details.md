This API handles;
* Get inventory details to populate inventory management view (page 9). Includes the product[] array.
* Also provides array relatedProductList
* Also provides array relatedProductCategoryList

url: `api/get-aggregated-inventory-details`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),

  inventoryId: Joi.number().required(),
}
```

### response (on error):
```
{
  "hasError": true,
  "error": {
    code,
    message
  }
}
```
Possible Error Codes:
```
{ code: VALIDATION_ERROR } // validation error on one of the fields
{ code: APIKEY_INVALID } // the api key is invalid
{ code: INVENTORY_INVALID } // inventory could not be found
```

### response (on success):
```
{
  "hasError": false,

  products: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().required(),
      count: Joi.number().required()
    });
  ),

  matchingProductList: Joi.array().items(
    Joi.object().keys({
      id: Joi.number().required(),
      productCategoryId: Joi.number().required(),
      purchasePrice: Joi.number().required(),
      salePrice: Joi.number().required()
    });
  ),

  matchingProductCategoryList: Joi.array().items(
    Joi.object().keys({
      id: Joi.number().required(),
      name: Joi.string().min(1).max(64).required(),
      organizationId: Joi.number().required(),
      parentProductCategoryId: Joi.number().required(),
      unit: Joi.string().required(),
      defaultDiscountType: Joi.string().required(),
      defaultDiscountValue: Joi.number().required(),
      defaultPurchasePrice: Joi.number().required(),
      defaultVat: Joi.number().required(),
      defaultSalePrice: Joi.number().required(),
    });
  )
}
```

### db changes:
updates no collection in db.