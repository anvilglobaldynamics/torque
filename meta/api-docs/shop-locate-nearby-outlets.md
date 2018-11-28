This public api locates outlets in a bounding rectangle

url: `api/shop-locate-nearby-outlets`

method: `POST`

### request: 
```js
Joi.object().keys({
  northEast: Joi.object().keys({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }).required(),
  southWest: Joi.object().keys({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }).required(),
  categoryCode: Joi.string().min(0).max(128).allow(null),
  searchString: Joi.string().min(3).max(128).allow('')
});
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
  Joi.object().keys({
    hasError: Joi.boolean().required().equal(false),
    outletList: Joi.array().required().items(
      Joi.object().keys({
        id: Joi.number().max(999999999999999).required(),
        name: Joi.string().min(1).max(64).required(),
        organizationName: Joi.string().min(1).max(64).required(),
        categoryCode: Joi.string().required(),
        location: Joi.object().keys({
          lat: Joi.number().required(),
          lng: Joi.number().required()
        }).required()
      });
    )
  });
}
```

### db changes:
updates No collection in db.