This API handles get organization’s employee list request.

url: `api/get-employee-list`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required()
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
{ code: ORGANIZATION_INVALID } // the organization id is invalid
```

### response (on success):
```js
{
  "hasError": false,
  "employeeList": Joi.array().items(
    Joi.object().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),

      userId: Joi.number().max(999999999999999).required(),
      userDetails: Joi.object().required().keys({
        fullName: Joi.string().min(1).max(64).required(),
        phone: Joi.string().regex(/^[a-z0-9\+]*$/i).min(11).max(15).required(),
        email: Joi.string().email().min(3).max(30).allow(null).required(),
        nid: Joi.string().min(16).max(16).allow('').required(),
        physicalAddress: Joi.string().min(1).max(128).allow('').required(),
        emergencyContact: Joi.string().min(1).max(128).allow('').required(),
        bloodGroup: Joi.string().alphanum().min(2).max(3).allow('').required()
      }),

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
        PRIV_ALLOW_FLEXIBLE_PRICE: Joi.boolean().required(),

        PRIV_MODIFY_DISCOUNT_PRESETS: Joi.boolean().required(),

        PRIV_VIEW_SALES_RETURN: Joi.boolean().required(),
        PRIV_MODIFY_SALES_RETURN: Joi.boolean().required(),

        PRIV_VIEW_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_MODIFY_ALL_PRODUCT_BLUEPRINTS: Joi.boolean().required(),
        PRIV_TRANSFER_ALL_INVENTORIES: Joi.boolean().required(),
        PRIV_ADD_PRODUCTS_TO_ALL_INVENTORIES: Joi.boolean().required(),

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
  )
}
```

### db changes:
updates no collection in db.