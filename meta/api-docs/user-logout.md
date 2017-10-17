
This API handles logging out of an user making the apiKey invalid.

url: `api/user-logout`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required()
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

### response (on success):
Logout is successful
```
{
  "hasError": false,
  "status": "success"
}
```

### notes:
updates the `session` collection in db.
