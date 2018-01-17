
## mongodb

1. Never use the $where clause.

## server -> apis

1. Always validate using `requestSchema` property. If not possible (i.e. for a `GET` Api) manually validate first using Joi. Write test cases specifically to test against injections.



