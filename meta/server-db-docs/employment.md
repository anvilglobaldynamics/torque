This collection contains an employment

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  userId: Joi.number().max(999999999999999).required(),
  organizationId: Joi.number().max(999999999999999).required(),

  designation: Joi.string().max(64).required(),
  role: Joi.string().max(64).required(),
  companyProvidedId: Joi.string().allow('').max(64).required(),
  
  privileges: Joi.object().required().keys({
    PRIV_VIEW_USERS: Joi.boolean().required(),
    PRIV_MODIFY_USERS: Joi.boolean().required(),

    PRIV_ACCESS_POS: Joi.boolean().required(),
    PRIV_VIEW_SALES: Joi.boolean().required(),
    PRIV_MODIFY_SALES: Joi.boolean().required(),
    PRIV_ALLOW_FLAT_DISCOUNT: Joi.boolean().required(),

    PRIV_VIEW_SALES_RETURN: Joi.boolean().required(),
    PRIV_MODIFY_SALES_RETURN: Joi.boolean().required(),

    PRIV_VIEW_ALL_INVENTORIES: Joi.boolean().required(),
    PRIV_MODIFY_ALL_INVENTORIES: Joi.boolean().required(),
    PRIV_TRANSFER_ALL_INVENTORIES: Joi.boolean().required(),
    PRIV_REPORT_DAMAGES_IN_ALL_INVENTORIES: Joi.boolean().required(),

    PRIV_VIEW_ALL_OUTLETS: Joi.boolean().required(),
    PRIV_MODIFY_ALL_OUTLETS: Joi.boolean().required(),

    PRIV_VIEW_ALL_WAREHOUSES: Joi.boolean().required(),
    PRIV_MODIFY_ALL_WAREHOUSES: Joi.boolean().required(),

    PRIV_VIEW_ORGANIZATION_STATISTICS: Joi.boolean().required(),
    PRIV_MODIFY_ORGANIZATION: Joi.boolean().required(),

    PRIV_VIEW_CUSTOMER: Joi.boolean().required(),
    PRIV_MODIFY_CUSTOMER: Joi.boolean().required(),
    PRIV_MANAGE_CUSTOMER_WALLET_BALANCE: Joi.boolean().required()
  }),
  isActive: Joi.boolean().required()
});
```