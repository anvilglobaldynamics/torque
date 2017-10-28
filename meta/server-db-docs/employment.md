This collection contains an employment

## signature
```
Joi.object().keys({
  createdDatetimeStamp: Joi.number().required(),
  lastModifiedDatetimeStamp: Joi.number().required(),
  userId: Joi.number().required(),
  organizationId: Joi.number().required(),
  designation: Joi.string().required(),
  role: Joi.string().required(),
  companyProvidedId: Joi.string().alphanum().required(),
  privileges: Joi.object().keys({
    PRIV_VIEW_USERS: Joi.boolean().required(),
    PRIV_MODIFY_USERS: Joi.boolean().required(),
    PRIV_ADD_USER: Joi.boolean().required(),
    PRIV_MAKE_USER_AN_OWNER: Joi.boolean().required(),
    PRIV_MODIFY_USER_PRIVILEGES: Joi.boolean().required(),

    PRIV_ACCESS_POS: Joi.boolean().required(),
    PRIV_VIEW_SALES: Joi.boolean().required(),
    PRIV_MODIFY_SALES: Joi.boolean().required(),
    PRIV_ALLOW_FLAT_DISCOUNT: Joi.boolean().required(),
    PRIV_ALLOW_INDIVIDUAL_DISCOUNT: Joi.boolean().required(),
    PRIV_ALLOW_FOC: Joi.boolean().required(),

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
    PRIV_ADD_CUSTOMER_DURING_SALES: Joi.boolean().required(),
    PRIV_MODIFY_CUSTOMER: Joi.boolean().required(),
    PRIV_MANAGE_CUSTOMER_DEBT: Joi.boolean().required()
  });
  isActive: Joi.boolean().required(),
});
```