This API handles gets role list to be assigned to new employee request.

url: `api/get-role-list`

method: `POST`

### request: 
```
{}
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
  "roleList": Joi.array().items(Joi.string().required())
}
```

### db changes:
updates No collection in db.