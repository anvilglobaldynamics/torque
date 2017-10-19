
let _knownErrorCodeList = [];

let Joi = require('joi');

class Api {

  static addKnownErrorCode(code) {
    _knownErrorCodeList.push(code);
  }

  constructor(server, database, logger, request, response, socket, channel, requestUid = null) {
    this.server = server;
    this.database = database;
    this.logger = logger;
    this._request = request;
    this._response = response;
    this._socket = socket;
    this._channel = channel;
    this._requestUid = requestUid;
  }

  // region: properties (subclass needs to override) ==========

  get autoValidates() {
    return false;
  }

  get requiresAuthentication() {
    return false;
  }

  // region: internals ==========

  _sendResponse(data) {
    if (this._channel === 'ws') {
      let reponse = {
        requestUid: this._requestUid,
        message: data
      }
      reponse = JSON.stringify(reponse);
      this._socket.send(reponse);
    } else {
      this._response.send(data);
    }
  }

  _prehandleGetApi() {
    this.handle();
  }

  _prehandlePostOrWsApi(body) {
    if (this.autoValidates) {
      let schema = this.requestSchema;
      if (this.requiresAuthentication) {
        schema = schema.keys({
          apiKey: Joi.string().length(64).required()
        })
      }
      let { error, value } = this.validate(body, schema);
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

  // region: interfaces (subclass needs to override these) ===========

  handle() {
    this.fail(new Error("Api Not Handled"));
    return
  }

  // region: network access ===============================

  fail(originalErrorObject, extraData) {
    let errorObject = this.failable(originalErrorObject, extraData);
    this._sendResponse({ hasError: true, error: errorObject });
  }

  validate(object, schema) {
    return Joi.validate(object, schema);
  }

  success(object = {}) {
    object.hasError = false;
    this._sendResponse(object);
  }

  getQueryParameters() {
    if (this._channel === 'get') {
      return this._request.params;
    }
    return {};
  }

  // region: access control ==========================

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

  // region: template rendering ==========================

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
    this._sendResponse(html);
  }

  // region: error handling =========================================

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

}

exports.Api = Api;
