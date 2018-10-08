This collection contains an sale

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedByUserId: Joi.number().max(999999999999999).allow(null).required(),
  outletId: Joi.number().max(999999999999999).required(),
  customerId: Joi.number().max(999999999999999).allow(null).required(),

  productList: Joi.array().required().length(1).items(
    Joi.object().keys({
      productId: Joi.number().max(999999999999999).required(),
      count: Joi.number().max(999999999999999).required(),
      discountType: Joi.string().max(1024).required(),
      discountValue: Joi.number().max(999999999999999).required(),
      salePrice: Joi.number().max(999999999999999).required()
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

    totalPaidAmount: Joi.number().max(999999999999999).required(),
    paymentList: Joi.array().required().items(
      Joi.object().keys({
        createdDatetimeStamp: Joi.number().max(999999999999999).required(),
        acceptedByUserId: Joi.number().max(999999999999999).required(),

        paidAmount: Joi.number().max(999999999999999).required(),
        changeAmount: Joi.number().max(999999999999999).required(),
        paymentMethod: Joi.string().valid('cash', 'card', 'digital', 'change-wallet').required(),
        wasChangeSavedInChangeWallet: Joi.boolean().required()   
      })
    )
  }),

  isModified: Joi.boolean().required(),
  isDeleted: Joi.boolean().required(),
  isDiscarded: Joi.boolean().required()
});
```