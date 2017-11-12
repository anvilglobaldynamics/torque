This API handles get selected organization report preview to populate master container request.

url: `api/get-dashboard-summary`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().required() 
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
{ code: ORGANIZATION_INVALID } // the organization id is invalid
```

### response (on success):
```js
{
  "hasError": false,
  "metrics": Joi.object().keys({
    totalNumberOfSalesToday: Joi.number().required(),
    totalAmountSoldToday: Joi.number().required(),
    totalNumberOfSalesThisMonth: Joi.number().required(),
    totalAmountSoldThisMonth: Joi.number().required()
  });
}
```

### db changes:
updates no collection in db.