This API handles user’s password reset request verification (from mail).

url: `api/user-verify-password-reset-request`

method: `GET`

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
updates no collection in db.