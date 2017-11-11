This API handles get selected organization report preview to populate master container request.

url: `api/get-dashboard-summary`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().required() 
}
```

### response (on error):
```
{
  "hasError": true,
  "error": {
    code,
    message
  }
}
```
Possible Error Codes:
```
{ code: VALIDATION_ERROR } // validation error on one of the fields
{ code: ORGANIZATION_INVALID } // the organization id is invalid
```

### response (on success):
```
{
  "hasError": false,
  "metrics": Joi.object().keys({
    totalNumberOfSalesToday: Joi.number().required(),
    totalAmountSoldToday: Joi.number().required()
  });
}
```

### db changes:
updates no collection in db.