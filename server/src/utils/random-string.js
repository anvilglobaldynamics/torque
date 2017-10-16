
let charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

exports.generateRandomString = (length) => {
  let result = '';
  for (var i = length; i > 0; --i) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
}
