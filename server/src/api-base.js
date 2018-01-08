
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

  // NOTE: See `_enforceAccessControl` for details.
  get accessControl() {
    return null;
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
              this._enforceAccessControl(userId, body, (err) => {
                if (err) {
                  this.fail(err);
                } else {
                  this.handle({ userId, body, apiKey });
                }
              });
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
    this.database.session.findByApiKey({ apiKey }, (err, session) => {
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

  /*
    enforces Access Control Rules. Rules are specified using the accessControl property. Format - 
    {
      privileges: [ ...list of privileges ]
      organizationBy: "keyName" or <function>
      guards: [<function>]
    }

    NOTES: 
      1. accessControl is only enforcible if both autoValidates and requiresAuthentication
         is true.
      2. do not specify accessControl if it is not required. Alternatively, you can return
         null or an empty object.
      3. if you do not specify "organizationBy" then your "privileges" array can not be 
         verified.
      4. If "organizationBy" is a string, that value is used to extract organizationId from
         request body.
      5. If "organizationBy" is a function, that function is called with (userId, body, (err, organization)=> ..)
         and is expected to return the organization as callback. The execution context is always the api.
      6. guards is an array of functions. the functions are called with (userId, body, (err)=> ..) and are expected
         to return an err via callback if they fail. The execution context is always the api.
  */
  _enforceAccessControl(userId, body, cbfn) {
    let rules = this.accessControl;
    if (!rules) return cbfn();
    let promise1 = new Promise((accept, reject) => {
      if (!('organizationBy' in rules)) return accept();
      let { privileges = [], organizationBy } = rules;
      new Promise((accept, reject) => {
        if (typeof (organizationBy) === "function") {
          organizationBy.call(this, userId, body, (err, organization) => {
            accept({ err, organization });
          });
        } else {
          let organizationId = body[organizationBy];
          this.database.organization.findById({ organizationId }, (err, organization) => {
            accept({ err, organization });
          })
        }
      }).then(({ err, organization }) => {
        if (err) return reject(err);
        if (!organization) {
          err = new Error("Organization could not be found during access control.");
          err.code = "ACCESS_CONTROL_INVALID_ORGANIZATION";
          return reject(err);
        }
        let organizationId = organization.id;
        this.database.employment.getEmploymentOfUserInOrganization({ userId, organizationId }, (err, employment) => {
          if (err) return reject(err);
          if (!employment) {
            err = new Error("User does not belong to organization.");
            err.code = "USER_NOT_EMPLOYED_BY_ORGANIZATION";
            return reject(err);
          }
          let unmetPrivileges = [];
          privileges.forEach((privilege) => {
            if (!employment.privileges[privilege]) {
              unmetPrivileges.push(privilege);
            }
          });
          if (unmetPrivileges.length > 0) {
            let message = "Unmet privileges. This action requires the following privileges - ";
            message += unmetPrivileges.join(', ') + ".";
            err = new Error(message);
            err.code = "ACCESS_CONTROL_UNMET_PRIVILEGES";
            err.privileges = unmetPrivileges;
            return reject(err);
          }
          return accept();
        });
      });
    });
    promise1.then(() => {
      cbfn(null);
    }).catch((err) => {
      cbfn(err);
    })
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
      this.logger.important('DevError: Invalid Error Object', errorObject);
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

  _translateKnownError(err) {
    if (!('code' in err)) return err;
    if (err.code === "DUPLICATE_email") {
      err = new Error("Provided email address is already in use");
      err.code = 'EMAIL_ALREADY_IN_USE';
    } else if (err.code === "DUPLICATE_phone") {
      err = new Error("Provided phone number is already in use");
      err.code = 'PHONE_ALREADY_IN_USE';
    }
    return err;
  }

  failable(originalErrorObject, extraData) {
    let errorObject = this._translateKnownError(originalErrorObject);
    errorObject = this._stringifyErrorObject(errorObject);
    errorObject = this._hideUnknownErrorsOnProduction(errorObject);
    this.logger.silent('error', originalErrorObject);
    this.logger.silent('error-response', errorObject);
    return errorObject;
  }

}

exports.Api = Api;
