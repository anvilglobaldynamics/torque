
let cryptolib = require('crypto');

exports.userCommonMixin = (SuperApiClass) => class extends SuperApiClass {

  _makeHash(string) {
    return cryptolib.createHash('sha256').update(string).digest("hex");
  }

}