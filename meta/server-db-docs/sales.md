This collection contains an sale

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  lastModifiedDatetimeStamp: Joi.number().required(),
  lastModifiedByUserId: Joi.number().required(),
  outletId: Joi.number().required(),
  customerId: Joi.number().required(),
  productList: Joi.array().items(
    Joi.object().keys({
      productId: Joi.number().required(),
      count: Joi.number().required(),
      discountType: Joi.string().required(),
      discountValue: Joi.number().required(),
      salePrice: Joi.number().required()
    });
  );
  payment: Joi.object().keys({
    totalAmount: Joi.number().required(),
    vatAmount: Joi.number().required(),
    discountType: Joi.string().required(),
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