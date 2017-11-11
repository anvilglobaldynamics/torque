This API handles check of network and server connection status

url: `api/health-check`

method: `GET`

### request: 
```
{
  clientDetails: Joi.object().keys({
    clientId: Joi.string().required(),
    platform: Joi.string().required(),
    location: Joi.string().required()
  })
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
```

### response (on success):
```
{
  "hasError": false,
  "healthStatus": Joi.object().keys({})
}
```

### db changes:
updates no collection in db.

### notes:
in future this could initiate health checks logs.