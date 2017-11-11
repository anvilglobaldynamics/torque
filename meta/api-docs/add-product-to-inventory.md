This API handles attempt to add one or more product to inventory.

url: `api/add-product-to-inventory`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),

  inventoryId: Joi.number().required(),

  productList: Joi.array().items(
    Joi.object().keys({
      productCategoryId: Joi.number().required(),
      purchasePrice: Joi.number().required(),
      salePrice: Joi.number().required(),
      count: Joi.number().required()
    });
  );
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
{ code: PRODUCT_CATEGORY_INVALID } // productCategoryId could not be found
```

### response (on success):
```
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `product` and `inventory` collections in db.