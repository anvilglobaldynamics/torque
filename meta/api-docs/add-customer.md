This API handles adding new customer.

url: `api/add-customer`

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