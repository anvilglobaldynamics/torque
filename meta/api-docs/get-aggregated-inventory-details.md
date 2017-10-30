This API handles;
* Get inventory details to populate inventory management view (page 9). Includes the product[] array.
* Also provides array relatedProductList
* Also provides array relatedProductCategoryList

url: `api/get-aggregated-inventory-details`

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