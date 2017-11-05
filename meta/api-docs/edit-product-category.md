This API handles attempt to update the product category.

url: `api/edit-product-category`

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
  "status": "success"
}
```

### db changes:
updates the `collection-name` collection in db.