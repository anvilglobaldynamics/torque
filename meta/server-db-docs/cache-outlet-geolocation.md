This collection contains a cache of outlet geolocations for fast lookup and indexing.

## signature
```js
Joi.object().keys({
  createdDatetimeStamp: Joi.number().max(999999999999999).required(),
  lastModifiedDatetimeStamp: Joi.number().max(999999999999999).required(),
  outletId: Joi.number().required(),
  location: Joi.object().keys({
    type: Joi.string().valid("Point"),
    coordinates: Joi.array().items(
      Joi.number().required(),
      Joi.number().required()
    ).length(2).required()
  }).required()
});
```