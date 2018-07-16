
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

function throwOnFalsy(value, code, message) {
  if (!value) {
    throw new CodedError(code, message);
  }
}

function throwOnTruthy(value, code, message) {
  throwOnFalsy(!value, code, message);
}

exports.ExtendableError = ExtendableError;
exports.CodedError = CodedError;
exports.throwOnFalsy = throwOnFalsy;
exports.throwOnTruthy = throwOnTruthy;