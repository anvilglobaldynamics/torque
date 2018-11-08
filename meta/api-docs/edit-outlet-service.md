This API handles attempt to edit a outlet's service information

url: `api/edit-outlet-service`

method: `POST`

### request: 
```js
{
  serviceId: Joi.number().max(999999999999999).required(),
  salePrice: Joi.number().min(0).max(999999999999999).required(),
  isAvailable: Joi.boolean().required()
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
{ code: SERVICE_INVALID } // service not found
{ code: GENERIC_UPDATE_ERROR }
```

### response (on success):
```js
{
  hasError: false,
  status: "success"
}
```

### db changes:
updates the `service` collection in db.