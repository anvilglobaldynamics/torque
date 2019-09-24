This API handles;
* Get product sales details to populate product sales report.

url: `api/report-product-sales-details`

method: `POST`

### request: 
```js
{
  organizationId: Joi.number().max(999999999999999).required(),
  outletId: Joi.number().max(999999999999999).allow(null).required(),
  productCategoryIdList: Joi.array().allow([]).min(0).items(
    Joi.number().max(999999999999999)
  ),
  productBlueprintIdList: Joi.array().allow([]).min(0).items(
    Joi.number().max(999999999999999)
  ),
  fromDate: Joi.number().max(999999999999999).required(),
  toDate: Joi.number().max(999999999999999).required()
}
```

NOTE: 

1. If both non-empty `productCategoryIdList` and non-empty `productBlueprintIdList` is provided, error `PREDETERMINER_SETUP_INVALID` is thrown.
2. Items in `productCategoryIdList` are applied in `AND` logic. As in, products will only be shown if they are available in ALL of the provided product categories.
3. Items in `productBlueprintIdList` are applied in `OR` logic. As in, products will only be shown if they are available in ANY of the provided product blueprints.

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
{ code: OUTLET_INVALID } // outlet could not be found
{ code: PRODUCT_CATEGORY_INVALID } // product category could not be found
{ code: PRODUCT_BLUEPRINT_INVALID } // product blueprint could not be found
{ code: PREDETERMINER_SETUP_INVALID } //  both productCategoryIdList and productBlueprintIdList are non-empty
```

### response (on success):
```js
{
  hasError: false,
  productSalesSummaryList: Joi.array().required().items({
    productId: Joi.number().required(),
    productBlueprintId: Joi.number().required(),
    sumCount: Joi.number().required(),
    sumSalePrice: Joi.number().required(),
    name: Joi.string().required(),
    unit: Joi.string().required()
  })
}
```

### db changes:
updates no collection in db.