This API handles hiring an already existing user.

url: `api/hire-user-as-employee`

method: `POST`

### request: 
```
{
  apiKey: Joi.string().length(64).required(),

  emailOrPhone: Joi.alternatives([
    Joi.string().email().min(3).max(30), // if email
    Joi.string().alphanum().min(11).max(14), // if phone
  ]).required(),

  role: Joi.string().required(),
  designation: Joi.string().required(),
  companyProvidedId: Joi.string().alphanum().required(),
  
  privileges: Joi.object().keys({
    [Look up privileges here](../server-db-docs/employment.md)
  });
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
{ code: ALREADY_EMPLOYED } // the user exists and is already employed by another organization
```

### response (on success):
```
{
  "hasError": false,
  "status": "success"
}
```

### db changes:
updates the `employment` collection in db.