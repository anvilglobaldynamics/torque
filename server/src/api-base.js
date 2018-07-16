
const Joi = require('joi');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const baselib = require('baselib');
const { CodedError } = require('./utils/coded-error');
const { Server } = require('./server');
const { DatabaseService } = require('./database-service');
const { Logger } = require('./logger');

const languageCache = {
  'en-us': require('./languages/en-us').verses,
  'bn-bd': require('./languages/bn-bd').verses
};

const SESSION_DURATION_LIMIT = 15 * 24 * 60 * 60 * 1000;

class Api {

  /**
  * @param {Server} server
  * @param {DatabaseService} database
  * @param {Logger} logger
  */
  constructor(server, database, logger, request, response, socket, channel, requestUid = null) {
    this.server = server;
    this.database = database;
    this.logger = logger;
    this._request = request;
    this._response = response;
    this._socket = socket;
    this._channel = channel;
    this._requestUid = requestUid;
    this.__paginationCache = null;
  }

  // region: properties (subclass needs to override) ==========

  get autoValidates() {
    return false;
  }

  get requiresAuthentication() {
    return false;
  }

  get autoPaginates() {
    return false;
  }

  // This can either be 'user' or 'admin'
  get authenticationLevel() {
    return 'user';
  }

  /*
    enforces Access Control Rules. Rules are specified using the accessControl property. Format - 
    [
      {
        privileges: [ ...list of privileges ]
        organizationBy: "keyName" or <function> or <object>
      }
    ]

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
      6. If "organizationBy" is an object, that object must have following properties - 
         "from" - name of the mongodb collection (IN HYPHENATED FROM)
         "query" - a sync function that received the request body as parameter and returns a query
         "select" - the value to select to be used as "organizationId"
         "errorCode" - override the default error code "ACCESS_CONTROL_INVALID_ORGANIZATION" with another one. (optional)
      7. If "organizationBy" is an array, it must contain objects mentioned in 6 in an array. Note that, the
         objects are processed from top to bottom. And the resulting "select"ed values are pushed into the "body" object
         passed to the "query" function.
  */
  get accessControl() {
    return null;
  }

  // This is a Joi Schema
  get requestSchema() {
    return null;
  }

  // region: internals ==========

  _sendResponse(data) {
    if (this._channel === 'ws') {
      let reponse = {
        requestUid: this._requestUid,
        message: data
      };
      reponse = JSON.stringify(reponse);
      try {
        this._socket.send(reponse);
      } catch (ex) {
        this.logger.error(ex);
      }
    } else {
      this._response.send(data);
    }
  }

  __applyPaginationToResponse(object) {
    if (!this.autoPaginates) return;
    if (!this.__paginationCache) return;
    let { offset, limit } = this.__paginationCache;
    this.autoPaginates.forEach(key => {
      if (!(key in object)) {
        throw new Error(`Developer Error: Expected key "${key}" in response to apply pagination`);
      }
      let list = object[key];
      let totalCount = list.length;
      list = list.slice(offset, (offset + limit));
      object[key] = list;
      object.pagination = {
        offset,
        limit: list.length,
        totalCount
      }
    });
  }

  __composeAndValidateSchema(body) {
    let schema = this.requestSchema;
    if (this.requiresAuthentication) {
      schema = schema.keys({
        apiKey: Joi.string().length(64).required()
      });
    }
    if (this.autoPaginates) {
      schema = schema.keys({
        paginate: Joi.object().optional().keys({
          offset: Joi.number().min(0).required(),
          limit: Joi.number().max(100).required()
        })
      });
    }
    schema = schema.keys({
      clientLanguage: Joi.string().valid('en-us', 'bn-bd').optional()
    });
    let { error, value } = this.validate(body, schema);
    if (error) throw error;
    return value;
  }

  __detectLanguage(body) {
    if ('clientLanguage' in body) {
      this.clientLanguage = body.clientLanguage;
      delete body['clientLanguage'];
    } else {
      this.clientLanguage = 'en-us';
    }
    this.verses = languageCache[this.clientLanguage];
  }

  __detectPagination(body) {
    if ('paginate' in body) {
      this.__paginationCache = body.paginate;
      delete body['paginate'];
    }
  }

  async __handleAuthentication() {
    let { apiKey } = body;
    if (this.authenticationLevel === 'admin') {
      let username = await this.authenticate(body);
      return { username, apiKey };
    } else {
      let userId = await this.authenticate(body);
      await this.__enforceAccessControl(userId, body);
      return { userId, apiKey };
    }
  }

  async _prehandle(originalBody) {
    try {
      let apiArgs = {};
      if (this.autoValidates) {
        let body = this.__composeAndValidateSchema(originalBody);
        body = this.sanitize(body);
        this.__detectLanguage(body);
        this.__detectPagination(body);
        if (this.requiresAuthentication) {
          let authData = await this.__handleAuthentication(body);
          Object.assign(apiArgs, authData);
        }
        apiArgs.body = body;
      }
      let response = await this.handle(apiArgs);
      response.hasError = false;
      this.__applyPaginationToResponse(response);
      this._sendResponse(response);
    } catch (originalErrorObject) {
      console.log("ERROR (TODO: REMOVE)", originalErrorObject);
      let errorObject = this._translateKnownError(originalErrorObject);
      errorObject = this._stringifyErrorObject(errorObject);
      errorObject = this._hideUnknownErrorsOnProduction(errorObject);
      this._sendResponse({ hasError: true, error: errorObject });
    }
  }

  // region: security ==========================

  validate(object, schema) {
    return Joi.validate(object, schema, {
      abortEarly: true,
      convert: true,
      allowUnknown: false
    });
  }

  sanitize(object) {
    if (typeof (object) === "string") return entities.encode(object);
    if (typeof (object) === "object" && object !== null) {
      if (Array.isArray(object)) {
        for (let i = 0; i < object.length; i++) {
          object[i] = this.sanitize(object[i]);
        }
      } else {
        let keys = Object.keys(object);
        for (let i = 0; i < keys.length; i++) {
          object[keys[i]] = this.sanitize(object[keys[i]]);
        }
      }
    }
    return object;
  }


  // region: access control ==========================

  async authenticate(body) {
    if (!('apiKey' in body)) {
      return this.fail(new Error(this.verses.apiCommon.apiKeyMissing));
    }
    let apiKey = body.apiKey;
    delete body['apiKey'];
    if (this.authenticationLevel === 'admin') {
      let adminSession = await this.database.adminSession.findByApiKey({ apiKey });
      if (!adminSession) {
        throw new CodedError("APIKEY_INVALID", this.verses.apiCommon.apikeyInvalid);
      }
      return adminSession.username;
    } else {
      let session = await this.database.sesssion.findByApiKey({ apiKey });
      if (!session) {
        throw new CodedError("APIKEY_INVALID", this.verses.apiCommon.apikeyInvalid);
      }
      let hasExpired = session.hasExpired || (((new Date).getTime() - session.createdDatetimeStamp) > SESSION_DURATION_LIMIT);
      if (hasExpired) {
        throw new CodedError("APIKEY_EXPIRED", this.verses.apiCommon.apikeyExpired);
      }
      return session.userId;
    }
  }

  __processAccessControlQuery(body, queryObject, cbfn) {
    let { from, query, select } = queryObject;
    query = query(body);
    this.legacyDatabase.findOne(from, query, (err, doc) => {
      if (err) return cbfn(err);
      cbfn(null, doc);
    });
  }

  __processAccessControlQueryArray(body, queryObjectArray, cbfn) {
    baselib.asyncForIn(queryObjectArray).forEach((next, queryObject, index) => {
      this.__processAccessControlQuery(body, queryObject, (err, doc) => {
        if (err) return cbfn(err);
        if (!doc || !(queryObject.select in doc)) {
          if ('errorCode' in queryObject) {
            err = new Error(`Access Control Rejection. Unable to locate ${queryObject.select} from ${queryObject.from}`);
            err.code = queryObject.errorCode;
            return cbfn(err);
          }
          return cbfn(null, null);
        }
        body[queryObject.select] = doc[queryObject.select];
        next();
      })
    }).finally(() => {
      cbfn(null, body[queryObjectArray[queryObjectArray.length - 1].select]);
    });
  }

  __processAccessControlRule(userId, body, rule) {
    return new Promise((accept, reject) => {
      if (!('organizationBy' in rule)) return accept();
      let { privileges = [], organizationBy } = rule;
      new Promise((accept, reject) => {
        if (typeof (organizationBy) === "function") {
          organizationBy.call(this, userId, body, (err, organization) => {
            accept({ err, organization });
          });
        } else if (typeof (organizationBy) === "string") {
          let organizationId = body[organizationBy];
          this.legacyDatabase.organization.findById({ organizationId }, (err, organization) => {
            accept({ err, organization });
          });
        } else {
          if (!Array.isArray(organizationBy)) {
            organizationBy = [organizationBy];
          }
          this.__processAccessControlQueryArray(body, organizationBy, (err, organizationId) => {
            if (err) return accept({ err });
            this.legacyDatabase.organization.findById({ organizationId }, (err, organization) => {
              accept({ err, organization });
            });
          });
        }
      }).then(({ err, organization }) => {
        if (err) return reject(err);
        if (!organization) {
          err = new Error(this.verses.organizationCommon.organizationInvalid);
          err.code = "ORGANIZATION_INVALID";
          return reject(err);
        }
        let organizationId = organization.id;
        this.legacyDatabase.employment.getEmploymentOfUserInOrganization({ userId, organizationId }, (err, employment) => {
          if (err) return reject(err);
          if (!employment || !employment.isActive) {
            err = new Error(this.verses.organizationCommon.userNotEmployedByOrganization);
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
            let message = this.verses.accessControlCommon.accessControlUnmetPrivileges;
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
  }

  async __enforceAccessControl(userId, body) {
    let rules = this.accessControl;
    if (!rules) return;
    return await Promise.all(rules.map(rule => this.__processAccessControlRule(userId, body, rule)));
  }


  // region: error handling =========================================

  _stringifyErrorObject(errorObject) {
    let details = {};
    if (!(errorObject instanceof Error)) {
      this.logger.important('DevError: Invalid Error Object', errorObject);
      throw new Error("expected errorObject to be an instanceof Error");
    }
    let code = 'GENERIC_SERVER_ERROR';
    if ('code' in errorObject) {
      code = errorObject.code;
    }
    if ('isJoi' in errorObject) {
      code = "VALIDATION_ERROR";
      details = errorObject.details;
      if (!('from' in details)) {
        details.from = 'other';
      }
    }
    let message = "Server error occurred. Admin has been notified.";
    if ('message' in errorObject) {
      message = errorObject.message;
    }
    let stack = errorObject.stack;
    return { code, message, stack, details };
  }

  _hideUnknownErrorsOnProduction(errorObject) {
    if (this.server.mode === 'production') {
      delete errorObject['stack'];
      if (_knownErrorCodeList.indexOf(errorObject.code) === -1) {
        errorObject.code = 'GENERIC_SERVER_ERROR';
        errorObject.message = this.verses.genericServerError;
      }
    }
    return errorObject;
  }

  _translateKnownError(err) {
    if (!('code' in err)) return err;
    if (err.code === "DUPLICATE_email") {
      err = new Error(this.verses.duplicationCommon.emailAlreadyInUse);
      err.code = 'EMAIL_ALREADY_IN_USE';
    } else if (err.code === "DUPLICATE_phone") {
      err = new Error(this.verses.duplicationCommon.phoneAlreadyInUse);
      err.code = 'PHONE_ALREADY_IN_USE';
    }
    return err;
  }

}

exports.Api = Api;