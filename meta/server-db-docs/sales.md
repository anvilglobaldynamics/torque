This collection contains an sale

## signature
```
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
      discountType: Joi.string().max(1024).required(),
      discountValue: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required()
    });
  );
  payment: Joi.object().keys({
    totalAmount: Joi.number().max(999999999999999).required(),
    vatAmount: Joi.number().max(999999999999999).required(),
    discountType: Joi.string().max(1024).required(),
    discountValue: Joi.number().max(999999999999999).required(),
    discountedAmount: Joi.number().max(999999999999999).required(),
    serviceChargeAmount: Joi.number().max(999999999999999).required(),
    totalBilled: Joi.number().max(999999999999999).required(),
    previousCustomerBalance: Joi.number().max(999999999999999).required(),
    paidAmount: Joi.number().max(999999999999999).required(),
    changeAmount: Joi.number().max(999999999999999).required()
  });
  isModified: Joi.boolean().required(),
  isDeleted: Joi.boolean().required()
});
```