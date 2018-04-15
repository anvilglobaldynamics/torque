
class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

class CodedError extends ExtendableError {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

exports.ExtendableError = ExtendableError;
exports.CodedError = CodedError;