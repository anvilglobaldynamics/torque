This API handles get the list of sales to populate sales lists request.

url: `api/get-sales-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),

  organizationId: Joi.number().max(999999999999999).required(),
  outletId: Joi.number().max(999999999999999).allow(null).required(),
  customerId: Joi.number().max(999999999999999).allow(null).required(),

  shouldFilterByOutlet: Joi.boolean().required(),
  shouldFilterByCustomer: Joi.boolean().required(),
  
  fromDate: Joi.number().max(999999999999999).required(),
  toDate: Joi.number().max(999999999999999).required(),

  includeExtendedInformation: Joi.boolean().optional(),
  searchString: Joi.string().min(0).max(64).allow('').optional() // NOTE: searchString is currently used for salesId. We can extend it for other purposes later
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
{ code: OUTLET_INVALID } // outlet could not be found 
{ code: CUSTOMER_INVALID } // customer could not be found
{ code: ORGANIZATION_INVALID } // organization could not be found
```

### response (on success, without includeExtendedInformation):
```js
{
  "hasError": false,

  "salesList": Joi.array().items(
    Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedByUserId: Joi.number().max(999999999999999).required(),
      outletId: Joi.number().max(999999999999999).required(),
      customerId: Joi.number().max(999999999999999).required(),

      customer: Joi.object().keys({
        id: Joi.number().max(999999999999999).required(),
        
        createdDatetimeStamp: Joi.number().max(999999999999999).required(),
        lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
        isDeleted: Joi.boolean().required(),
      
        fullName: Joi.string().min(1).max(64).required(),
        phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
        organizationId: Joi.number().max(999999999999999).required(),
        changeWalletBalance: Joi.number().max(999999999999999).required(),
        
        withdrawalHistory: Joi.array().items(
          Joi.object().keys({
            creditedDatetimeStamp: Joi.number().max(999999999999999).required(),
            byUserId: Joi.number().max(999999999999999).required(),
            amount: Joi.number().max(999999999999999).required()
          })
        )
      }),

      productList: Joi.array().items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().max(999999999999999).required(),

          product: Joi.object().keys({
            id: Joi.number().max(999999999999999).required(),
            productBlueprintId: Joi.number().max(999999999999999).required(),
            purchasePrice: Joi.number().max(999999999999999).required(),
            salePrice: Joi.number().max(999999999999999).required()
          }),

          productBlueprint: Joi.object().keys({
            id: Joi.number().max(999999999999999).required(),
    
            createdDatetimeStamp: Joi.number().max(999999999999999).required(),
            lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
          
            name: Joi.string().min(1).max(64).required(),
            organizationId: Joi.number().max(999999999999999).required(),
            unit: Joi.string().max(64).required(),
            defaultPurchasePrice: Joi.number().max(999999999999999).required(),
            defaultVat: Joi.number().max(999999999999999).required(),
            defaultSalePrice: Joi.number().max(999999999999999).required(),
            
            isDeleted: Joi.boolean().required(),
            isReturnable: Joi.boolean().required()
          
          })
        })
      ),

      serviceList: Joi.array().required().items(
        Joi.object().keys({
          serviceId: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().min(0).max(999999999999999).required(),
          vatPercentage: Joi.number().min(0).max(999999999999999).required(),
          assignedEmploymentId: Joi.number().max(999999999999999).allow(null).required(),

          service: Joi.object().keys({
            id: Joi.number().max(999999999999999).required(),

            createdDatetimeStamp: Joi.number().max(999999999999999).required(),
            lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
            createdByUserId: Joi.number().max(999999999999999).required(),
          
            serviceBlueprintId: Joi.number().max(999999999999999).required(),
            outletId: Joi.number().max(999999999999999).required(),
            
            salePrice: Joi.number().min(0).max(999999999999999).required(),
            isAvailable: Joi.boolean().required()
          }),

          serviceBlueprint: Joi.object().keys({
            id: Joi.number().max(999999999999999).required(),
            
            createdDatetimeStamp: Joi.number().max(999999999999999).required(),
            lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
          
            name: Joi.string().min(1).max(64).required(),
            organizationId: Joi.number().max(999999999999999).required(),
          
            defaultVat: Joi.number().min(0).max(999999999999999).required(),
            defaultSalePrice: Joi.number().min(0).max(999999999999999).required(),
            
            isLongstanding: Joi.boolean().required(),
            serviceDuration: Joi.object().allow(null).required().keys({
              months: Joi.number().min(0).max(999999999999999).required(),
              days: Joi.number().min(0).max(999999999999999).required(),
            }),
          
            isEmployeeAssignable: Joi.boolean().required(),
            isCustomerRequired: Joi.boolean().required(),
            isRefundable: Joi.boolean().required(),
            isDeleted: Joi.boolean().required()
          })
        })
      ),

      payment: Joi.object().keys({
        totalAmount: Joi.number().max(999999999999999).required(),
        vatAmount: Joi.number().max(999999999999999).required(),
        discountType: Joi.string().max(1024).required(),
        discountValue: Joi.number().max(999999999999999).required(),
        discountedAmount: Joi.number().max(999999999999999).required(),
        serviceChargeAmount: Joi.number().max(999999999999999).required(),
        totalBilled: Joi.number().max(999999999999999).required(),
        paidAmount: Joi.number().max(999999999999999).required(),
        changeAmount: Joi.number().max(999999999999999).required()
      }),

      isModified: Joi.boolean().required()
    });
  )
}
```

### response (on success, includeExtendedInformation):
```js
{
  "hasError": false,

  "salesList": Joi.array().items(
    Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedByUserId: Joi.number().max(999999999999999).required(),
      outletId: Joi.number().max(999999999999999).required(),
      customerId: Joi.number().max(999999999999999).required(),
      productList: Joi.array().items(
        Joi.object().keys({
          productId: Joi.number().max(999999999999999).required(),
          count: Joi.number().max(999999999999999).required(),
          salePrice: Joi.number().max(999999999999999).required(),
          productBlueprint: Joi.object().required()
        })
      ),
      payment: Joi.object().keys({
        totalAmount: Joi.number().max(999999999999999).required(),
        vatAmount: Joi.number().max(999999999999999).required(),
        discountType: Joi.string().max(1024).required(),
        discountValue: Joi.number().max(999999999999999).required(),
        discountedAmount: Joi.number().max(999999999999999).required(),
        serviceChargeAmount: Joi.number().max(999999999999999).required(),
        totalBilled: Joi.number().max(999999999999999).required(),
        paidAmount: Joi.number().max(999999999999999).required(),
        changeAmount: Joi.number().max(999999999999999).required()
      }),
      customer: Joi.object().optional(),
      isModified: Joi.boolean().required()
    });
  )
}
```

### db changes:
updates no collection in db.

### NOTE:

if `searchString` is present and it is an ID, other filters are ignored as sales#id is unique.