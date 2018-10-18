This API handles attempt to add one or more product to inventory.

url: `api/add-product-to-inventory`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  inventoryId: Joi.number().max(999999999999999).required(),

  productList: Joi.array().min(1).items(
    Joi.object().keys({
      productCategoryId: Joi.number().max(999999999999999).required(),
      purchasePrice: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required(),
      count: Joi.number().max(999999999999999).required()
    });
  )
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
{ code: PRODUCT_CATEGORY_INVALID } // productCategoryId could not be found
```

### response (on success):
```js
{
  hasError: Joi.boolean().required().equal(false),
  status: Joi.array().required().equal('success'),
  insertedProductList: Joi.array().required().items(
    Joi.object().keys({
      productId: Joi.number().required(),
      count: Joi.number().required(),
    })
  )
}
```

### db changes:
updates the `product` and `inventory` collections in db.