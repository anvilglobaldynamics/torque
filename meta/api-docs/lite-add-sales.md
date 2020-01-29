
This API handles get the adding of new sales from torque-lite.

url: `api/lite-add-sales`

method: `POST`

### request: 
```js
{

  outletId: Joi.number().max(999999999999999).required(),

  customer: Joi.object().keys({
    fullName: Joi.string().min(1).max(64).required(),
    phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(4).max(14).allow(null).required(),
    email: Joi.string().email().min(3).max(30).allow(null).required(),
  }).allow(null),

  productList: Joi.array().required().items(
    Joi.object().keys({
      productBlueprintId: Joi.number().max(999999999999999).allow(null).required(),
      name: Joi.string().min(1).max(64).required(),
      count: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required(),
    })
  ),

  payment: Joi.object().required().keys({
    totalAmount: Joi.number().max(999999999999999).required(), // means total sale price of all products
    vatAmount: Joi.number().max(999999999999999).required(),
    vatPercentage: Joi.number().max(999999999999999).required(), // Note: Is moved to productList when processing.
    discountType: Joi.string().valid('percent', 'fixed').required(),
    discountValue: Joi.number().max(999999999999999).required(),
    discountedAmount: Joi.number().max(999999999999999).required(),
    serviceChargeAmount: Joi.number().max(999999999999999).required(),
    totalBillBeforeRounding: Joi.number().max(999999999999999).required(),
    roundedByAmount: Joi.number().max(999999999999999).required(),
    totalBilled: Joi.number().min(0).max(999999999999999).required(), // this is the final amount customer has to pay (regardless of the method)

    // NOTE: below is a single payment.
    paymentMethod: Joi.string().valid('cash', 'card', 'digital', 'change-wallet').required(),
    paidAmount: Joi.number().max(999999999999999).required(),
    changeAmount: Joi.number().max(999999999999999).required(),
  })

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
{ code: CUSTOMER_INVALID } // customer could not be found
{ code: PRODUCT_INVALID } // product could not be found
{ code: NO_PRODUCT_OR_SERVICE_SELECTED } // Both productList and serviceList can not be empty.
```

### response (on success, without includeExtendedInformation):
```js
{
  hasError: Joi.boolean().required().equal(false),
  status: Joi.string().required().equal('success'),
  receiptToken: Joi.string().length(6).required(),
  sentVia: Joi.string().valid('none', 'print', 'email', 'sms', 'own-sms').required(),
  productBlueprintIdList: Joi.array().allow([]).min(0).items(
    Joi.object().keys({
      productBlueprintId: Joi.number().max(999999999999999)
    })
  ),
  salesId: Joi.number().required()
}
```

### db changes:
Updates the `sales`, `customer`, `product`, `product-acquisition` and `product-blueprint` collection in db.
