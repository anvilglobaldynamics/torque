
let _knownErrorCodeList = [];

let Joi = require('joi')

class Api {

  constructor(server, database, logger, request, response) {
    this.server = server;
    this.database = database;
    this.logger = logger;
    this.request = request;
    this.response = response;
  }

  get autoValidates() {
    return false;
  }

  get requiresAuthentication() {
    return false;
  }

  static addKnownErrorCode(code) {
    _knownErrorCodeList.push(code);
  }

  _stringifyErrorObject(errorObject) {
    if (!(errorObject instanceof Error)) {
      throw new Error("expected errorObject to be an instanceof Error");
    }
    let code = 'GENERIC_SERVER_ERROR';
    if ('code' in errorObject) {
      code = errorObject.code;
    }
    if ('isJoi' in errorObject) {
      code = "VALIDATION_ERROR"
    }
    let message = "Server error occurred. Admin has been notified.";
    if ('message' in errorObject) {
      message = errorObject.message;
    }
    let stack = errorObject.stack;
    return { code, message, stack };
  }

  _hideUnknownErrorsOnProduction(errorObject) {
    if (this.server.mode === 'production') {
      delete errorObject['stack'];
      if (_knownErrorCodeList.indexOf(errorObject.code) === -1) {
        errorObject.code = 'GENERIC_SERVER_ERROR'
        errorObject.message = 'Server error occurred. Admin has been notified.'
      }
    }
    return errorObject;
  }

  failable(originalErrorObject, extraData) {
    let errorObject = this._stringifyErrorObject(originalErrorObject);
    errorObject = this._hideUnknownErrorsOnProduction(errorObject);
    this.logger.silent('error', originalErrorObject);
    this.logger.silent('error-response', errorObject);
    return errorObject;
  }

  fail(originalErrorObject, extraData) {
    let errorObject = this.failable(originalErrorObject, extraData);
    this.response.send({ hasError: true, error: errorObject });
  }

  validate(object, schema) {
    return Joi.validate(object, schema);
  }

  success(object = {}) {
    object.hasError = false;
    this.response.send(object);
  }

  authenticate(body, cbfn) {
    if (!('apiKey' in body)) {
      return this.fail(new Error("Developer Error: apiKey is missing from body."));
    }
    let apiKey = body.apiKey;
    delete body['apiKey'];
    this.database.getSessionByApiKey(apiKey, (err, session) => {
      if (err) return this.fail(err);
      if (!session) return this.fail(new Error("Invalid apiKey Provided!"));
      let hasExpired = session.hasExpired || (((new Date).getTime() - session.createdDatetimeStamp) > 24 * 60 * 60 * 1000);
      if (hasExpired) {
        err = new Error("Invalid apiKey Provided!");
        err.code = "APIKEY_EXPIRED";
        return this.fail(err);
      }
      cbfn(null, session.userId);
    });
    
  }

  sendGenericHtmlMessage(title, body, errorObject = null) {
    let model = {
      title,
      body
    }
    if (errorObject && this.server.mode === 'development') {
      model.error = JSON.stringify(errorObject);
      model.error = model.error.replace(/\\n/g, '<br>');
    }
    let html = this.server.templateManager.generateHtml('generic-message', model);
    this.response.send(html);
  }

  prehandleGetApi() {
    this.handle();
  }

  prehandlePostApi() {
    let body;
    if (this.autoValidates) {
      let schema = this.requestSchema;
      if (this.requiresAuthentication) {
        schema = schema.keys({
          apiKey: Joi.string().length(64).required()
        })
      }
      let { error, value } = this.validate(this.request.body, schema);
      if (error) {
        this.fail(error, error);
      } else {
        body = value;
        if (this.requiresAuthentication) {
          let { apiKey } = body;
          this.authenticate(body, (err, userId) => {
            if (err) {
              this.fail(err);
            } else {
              this.handle({ userId, body, apiKey });
            }
          })
        } else {
          this.handle({ body });
        }
      }
    }
  }

  handle() {
    this.fail(new Error("Api Not Handled"));
    return
  }

}

exports.Api = Api;
