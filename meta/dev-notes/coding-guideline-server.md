
## Methods

1. All instance methods are camelCase.
2. All static methods are camelCase.
3. All public methods (those are used from outside) must not have any `_` before.
4. All shared methods (those are not used from outside, but are used by inheriting class) must start with a single `_`.
5. All private methods (those are not used by any other class) must start with 2 or more `_`.
6. Method that is used by another method in the same class must be written before the method that uses that.
7. Parameters are passed around in objects (as named key/value pairs). i.e. use `User#setEmail({ id }, { email })` instead of `User#setEmail(id, email)`.

## Collections

1. All methods that return one document must start with `find`. i.e. `findByApiKey`.
2. All methods that may list more than one document must start with `list`. i.e. `listByName`.
3. Every collection has these inherited methods `findById`, `listByIdList` and `deleteById`.
4. Every method that finds a document by id and updates it, must start with `set`. i.e. `setProfile`.
5. Methods that do complex operations should have names that explain their action. i.e. `expireByUserIdWhenFired`.
6. When referring to the id of the same collection, parameter must not be prefixed by collection name. i.e. use `User#setEmail({ id }, { email })` instead of `User#setEmail({ userId }, { email })`.

