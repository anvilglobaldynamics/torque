This API handles get organization’s warehouse list request.

url: `api/get-warehouse-list`

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
  "hasError": false
}
```

### db changes:
updates the `collection-name` collection in db.