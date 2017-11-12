This API handles check of network and server connection status

url: `api/internal-health-check`

method: `POST`

### request: 
```js
{
  clientDetails: Joi.object().keys({
    clientId: Joi.string(),
    platform: Joi.string(),
    location: Joi.string()
  })
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
```

### response (on success):
```js
{
  "hasError": false,
  "healthStatus": Joi.object().keys({})
}
```

### db changes:
updates no collection in db.

### notes:
in future this could initiate health checks logs.