
const { CodedError } = require('./coded-error');

function extract(object, keyList) {
  if (typeof (object) !== 'object' || object === null) {
    throw new CodedError("GENERIC_OBJECT_NOT_OBJECT", "Expected object to be an object");
  }
  let newObject = {};
  for (let key of keyList) {
    if (!object.hasOwnProperty(key)) {
      throw new CodedError("GENERIC_OBJECT_KEY_MISSING", `Expected object to have key "${key}"`);
    }
    newObject[key] = object[key];
  }
  return newObject;
}

exports.extract = extract;