This API handles;
* Get inventory details to populate invetory report.

url: `api/report-inventory-details`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  inventoryIdList: Joi.array().min(1).items(
    Joi.number().max(999999999999999).required()
  ),
  productCategoryIdList: Joi.array().optional().default([]).allow([]).min(0).items(
    Joi.number().max(999999999999999)
  ),
  productBlueprintIdList: Joi.array().optional().default([]).allow([]).min(0).items(
    Joi.number().max(999999999999999)
  )
}
```

NOTE: 

1. If both non-empty `productCategoryIdList` and non-empty `productBlueprintIdList` is provided, error thrown.
2. Items in `productCategoryIdList` are applied in `AND` logic. As in, products will only be shown if they are available in ALL of the provided product categories.
3. Items in `productCategoryIdList` are applied in `OR` logic. As in, products will only be shown if they are available in ANY of the provided product categories.

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

  aggregatedInventoryDetailsList: Joi.array().items(
    Joi.object().keys({

      inventoryDetails: Joi.object().keys({
        inventoryName: Joi.string().min(1).max(64).required(),
        inventoryId: Joi.number().max(999999999999999).required()
      }),

      inventoryContainerDetails: Joi.object().keys({
        inventoryContainerType: Joi.string().valid('outlet', 'warehouse').required(),
        inventoryContainerId: Joi.number().max(999999999999999).required(),
        inventoryContainerName: Joi.string().min(1).max(64).required()
      }),

      aggregatedProductList: Joi.array().keys({
        productId: Joi.number().max(999999999999999).required(),
        count: Joi.number().max(999999999999999).required(),

        product: Joi.object().keys({
          id: Joi.number().max(999999999999999).required(),
          productBlueprintId: Joi.number().max(999999999999999).required(),
          purchasePrice: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().max(999999999999999).required(),
          
          productBlueprint: Joi.object().keys({
            id: Joi.number().max(999999999999999).required(),
            createdDatetimeStamp: Joi.number().max(999999999999999).required(),
            lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
            name: Joi.string().min(1).max(64).required(),
            organizationId: Joi.number().max(999999999999999).required(),
            unit: Joi.string().max(64).required(),
            identifierCode: Joi.string().max(64).allow('').required(),
            defaultPurchasePrice: Joi.number().max(999999999999999).required(),
            defaultVat: Joi.number().max(999999999999999).required(),
            defaultSalePrice: Joi.number().max(999999999999999).required(),
            isDeleted: Joi.boolean().required(),
            isReturnable: Joi.boolean().required()
          })
        })
      })

    })
  )
}
```

### db changes:
updates no collection in db.