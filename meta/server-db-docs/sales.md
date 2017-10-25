This collection contains an sale

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  lastModifiedDatetimeStamp: Joi.number().required(),
  lastModifiedByUserId: Joi.number().required(),
  outletId: Joi.number().required(),
  customerId: Joi.number().required(),
  <!-- TODO: ProductList -->
  payment: Joi.object().keys({
    totalAmount: Joi.number().required(),
    vatAmount: Joi.number().required(),
    <!-- TODO: DiscountType -->
    discountValue: Joi.number().required(),
    discountedAmount: Joi.number().required(),
    serviceChargeAmount: Joi.number().required(),
    totalBilled: Joi.number().required(),
    previousCustomerBalance: Joi.number().required(),
    paidAmount: Joi.number().required(),
    changeAmount: Joi.number().required()
  });
  isModified: Joi.boolean().required(),
  isDeleted: Joi.boolean().required()
});
```