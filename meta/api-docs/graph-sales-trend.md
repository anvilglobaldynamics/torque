This API handles;
* returns graph data for sales trend visualization.

url: `api/graph-sales-trend`

method: `POST`

### request: 
```js
{
  apiKey: Joi.string().length(64).required(),
  organizationId: Joi.number().max(999999999999999).required(),
  outletId: Joi.number().max(999999999999999).allow(null).required(),
  fromDate: Joi.number().max(999999999999999).required(),
  periodLevel: Joi.string().valid('week', 'month', 'year-quarterly', 'year-monthly')
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
{ code: APIKEY_INVALID } // the api key is invalid
{ code: OUTLET_INVALID } // inventory could not be found
```

### response (on success):
```js
{
  hasError: Joi.boolean().required().equal(false),
  graphData: Joi.object().keys({
    labelList: Joi.array().items(Joi.string()).required(),
    sumTotalBilledList: Joi.array().items(Joi.number()).required(),
    sumCountList: Joi.array().items(Joi.number()).required()
  })   
}
```

### db changes:
updates no collection in db.