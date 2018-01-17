This API handles view employee information request.

url: `api/get-employee`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  employmentId: Joi.number().max(999999999999999).required()
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
{ code: EMPLOYEE_INVALID } // employee does not exist
```

### response (on success):
```js
{
  "hasError": false,
  "employee": Joi.object().keys({
    createdDatetimeStamp: Joi.number().max(999999999999999).required(),
    lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
    userId: Joi.number().max(999999999999999).required(),
    organizationId: Joi.number().max(999999999999999).required(),
    designation: Joi.string().max(1024).required(),
    role: Joi.string().max(1024).required(),
    companyProvidedId: Joi.string().alphanum().allow('').max(1024).required(),
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
      PRIV_ADD_CUSTOMER_DURING_SALES: Joi.boolean().required(),
      PRIV_MODIFY_CUSTOMER: Joi.boolean().required(),
      PRIV_MANAGE_CUSTOMER_DEBT: Joi.boolean().required()
    }),
    isActive: Joi.boolean().required()
  });
}
```

### db changes:
updates No collection in db.