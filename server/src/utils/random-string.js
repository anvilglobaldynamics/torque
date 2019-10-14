
let charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

exports.generateRandomString = (length) => {
  let result = '';
  for (var i = length; i > 0; --i) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
}

let charset2 = '0123456789abcdefghijklmnopqrstuvwxyz';

exports.generateRandomStringCaseInsensitive = (length) => {
  let result = '';
  for (var i = length; i > 0; --i) {
    result += charset2[Math.floor(Math.random() * charset2.length)];
  }
  return result;
}