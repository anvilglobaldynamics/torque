This API handles get selected organization report preview to populate master container request.

url: `api/get-dashboard-summary`

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
  hasError: true,
  error: {
    code,
    message
  }
}
```

Possible Error Codes:
```js
{ code: VALIDATION_ERROR } // validation error on one of the fields
{ code: ORGANIZATION_INVALID } // the organization id is invalid
```

### response (on success):
```js
{
  hasError: false,

  metrics: Joi.object().keys({
    totalNumberOfSalesToday: Joi.number().max(999999999999999).required(),
    totalAmountSoldToday: Joi.number().max(999999999999999).required(),
    totalNumberOfSalesThisMonth: Joi.number().max(999999999999999).required(),
    totalAmountSoldThisMonth: Joi.number().max(999999999999999).required()
  }),

  organizationPackageDetails: Joi.object().allow(null).keys({
    packageActivation: Joi.object().required().keys({
      createdDatetimeStamp: Joi.number().max(999999999999999).required(),
      lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
      packageCode: Joi.string().required(),
      organizationId: Joi.number().max(999999999999999).required(),
      isDiscarded: Joi.boolean().required()
    }),
    packageDetail: Joi.object().required().keys({
      // TODO: to be finalized
    })
  })
}
```

### db changes:
updates no collection in db.