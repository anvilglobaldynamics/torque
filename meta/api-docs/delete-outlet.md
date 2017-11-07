This API handles attempt to delete outlet.

url: `api/delete-outlet`

method: `POST`

### request: 
```
{

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
{ code: INVENTORY_NOT_EMPTY } // the inventory contained in this inventory container is not empty
```

### response (on success):
```
{
  "hasError": false
}
```

### db changes:
updates the `collection-name` collection in db.