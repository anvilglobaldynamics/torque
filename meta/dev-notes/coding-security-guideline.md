
## mongodb

1. Never use the $where clause.

## server -> apis

1. Always validate using `requestSchema` property. If not possible (i.e. for a `GET` Api) manually validate first using Joi. Write test cases specifically to test against injections.
2. User input in Regex always need to be escaped. https://codereview.stackexchange.com/questions/153691/escape-user-input-for-use-in-js-regex
3. Safe regex is good regex https://www.npmjs.com/package/safer-regex https://github.com/substack/safe-regex



