
const Joi = require('joi');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const baselib = require('baselib');

const { CodedError } = require('./utils/coded-error');

const ModernApi = require('./api-base').Api;

const languageCache = {
  'en-us': require('./languages/en-us').verses,
  'bn-bd': require('./languages/bn-bd').verses
};

const SESSION_DURATION_LIMIT = 15 * 24 * 60 * 60 * 1000;

const _restrictedErrorCodeList = [
  "INTERNAL_SERVER_ERROR"
];

class LegacyApi {

  constructor(server, legacyDatabase, logger, request, response, socket, channel, requestUid = null, consumerId = null) {
    this.server = server;
    this.legacyDatabase = legacyDatabase;
    this.logger = logger;
    this._request = request;
    this._response = response;
    this._socket = socket;
    this._channel = channel;
    this._requestUid = requestUid;
    this.__paginationCache = null;
    this._consumerId = consumerId;
    this.__assignFailsafeLanguageFeature();
  }

  __assignFailsafeLanguageFeature() {
    // NOTE: necessary to avoid some errors in production.
    this.clientLanguage = 'en-us';
    this.verses = languageCache[this.clientLanguage];
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

  get authenticationLevel() {
    return 'user';
  }

  // Set it to false to temporarily disable the API for everyone.
  get isEnabled() {
    return true;
  }

  // NOTE: See `_enforceAccessControl` for details.
  get accessControl() {
    return null;
  }

  // Makes sure the organization has purchased a subscription. Works only if accessControl is provided and functional.
  get requiresSubscription() {
    return true;
  }

  // region: internals ==========

  _sendResponse(data) {
    data = ModernApi.prototype.__removeMongodbObjectIdReferrences.call(this, data);
    if (this._channel === 'ws') {
      let reponse = {
        operation: 'response-proxy',
        requestUid: this._requestUid,
        consumerId: this._consumerId,
        body: data
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

  _prehandleGetApi() {
    this.handle();
    if (!this.isEnabled) {
      let err = new CodedError("API_DISABLED", "This action has been disabled by the developers. Please contact our call center for more information.");
      return this.fail(err);
    }
  }

  _prehandlePostOrWsApi(body) {
    if (!this.isEnabled) {
      let err = new CodedError("API_DISABLED", "This action has been disabled by the developers. Please contact our call center for more information.");
      return this.fail(err);
    }
    if (this.autoValidates) {
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
      if (error) {
        return this.fail(error, error);
      } else {
        body = this.sanitize(value);
        if ('clientLanguage' in body) {
          this.clientLanguage = body.clientLanguage;
          delete body['clientLanguage'];
        } else {
          this.clientLanguage = 'en-us';
        }
        this.verses = languageCache[this.clientLanguage];
        if ('paginate' in body) {
          this.__paginationCache = body.paginate;
          delete body['paginate'];
        }
        if (this.requiresAuthentication) {
          let { apiKey } = body;
          if (this.authenticationLevel === 'admin') {
            this.authenticate(body, (err, username) => {
              if (err) this.fail(err);
              return this.handle({ username, body, apiKey });
            });
          } else {
            this.authenticate(body, (err, userId) => {
              if (err) this.fail(err);
              this._enforceAccessControl(userId, body, (err) => {
                if (err) {
                  return this.fail(err);
                } else {
                  this.database = this.server.database;
                  ModernApi.prototype.__handleSubscriptionVerification.call(this, body).then(() => {
                    return this.handle({ userId, body, apiKey });
                  }).catch(err => {
                    return this.fail(err);
                  });
                }
              });
            });
          }
        } else {
          return this.handle({ body });
        }
      }
    }
  }

  _applyPaginationToResponse(object) {
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

  // region: interfaces (subclass needs to override these) ===========

  handle() {
    return this.fail(new Error(this.verses.apiCommon.apiNotHandled));
  }

  // region: network access ===============================

  fail(originalErrorObject, extraData) {
    let errorObject = this.failable(originalErrorObject, extraData);
    this._sendResponse({ hasError: true, error: errorObject });
    return false; // NOTE: This is necessary for Array.every to work
  }

  success(object = {}) {
    object.hasError = false;
    this._applyPaginationToResponse(object);
    this._sendResponse(object);
    return true; // NOTE: This is necessary for Array.some to work
  }

  getQueryParameters() {
    if (this._channel === 'get') {
      return this._request.params;
    }
    return {};
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

  authenticate(body, cbfn) {
    if (!('apiKey' in body)) {
      return this.fail(new Error(this.verses.apiCommon.apiKeyMissing));
    }
    let apiKey = body.apiKey;
    delete body['apiKey'];
    if (this.authenticationLevel === 'admin') {
      this.legacyDatabase.adminSession.findByApiKey({ apiKey }, (err, adminSession) => {
        if (err) return this.fail(err);
        if (!adminSession) {
          err = new Error(this.verses.apiCommon.apikeyInvalid);
          err.code = "APIKEY_INVALID";
          return this.fail(err);
        }
        cbfn(null, adminSession.username);
      });
    } else {
      this.legacyDatabase.session.findByApiKey({ apiKey }, (err, session) => {
        if (err) return this.fail(err);
        if (!session) {
          err = new Error(this.verses.apiCommon.apikeyInvalid);
          err.code = "APIKEY_INVALID";
          return this.fail(err);
        }
        let hasExpired = session.hasExpired || (((new Date).getTime() - session.createdDatetimeStamp) > SESSION_DURATION_LIMIT);
        if (hasExpired) {
          err = new Error(this.verses.apiCommon.apikeyExpired);
          err.code = "APIKEY_EXPIRED";
          return this.fail(err);
        }
        cbfn(null, session.userId);
      });
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

  /*
    enforces Access Control Rules. Rules are specified using the accessControl property. Format - 
    [
      {
        privilegeList: [ ...list of privileges ]
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
  _enforceAccessControl(userId, body, cbfn) {
    let rules = this.accessControl;
    if (!rules) return cbfn();
    rules.forEach(rule => {
      rule.privileges = rule.privilegeList;
      delete rule['privilegeList'];
    })
    Promise.all(rules.map((rule) => this.__processAccessControlRule(userId, body, rule)))
      .then(() => {
        cbfn();
      })
      .catch(err => {
        cbfn(err);
      });
  }

  // region: template rendering ==========================

  sendGenericHtmlMessage(title, body, errorObject = null) {
    let model = {
      title,
      body
    };
    if (errorObject && this.server.mode === 'development') {
      model.error = JSON.stringify(errorObject);
      model.error = model.error.replace(/\\n/g, '<br>');
    }
    let html = this.server.templateManager.generateHtml('generic-message', model);
    this._sendResponse(html);
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

  _hideRestrictedErrorsOnProduction(errorObject) {
    if (this.server.mode === 'production') {
      delete errorObject['stack'];
      if (_restrictedErrorCodeList.indexOf(errorObject.code) > -1) {
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
    } else if (err.code === "DUPLICATE_organizationId+phone") {
      err = new Error(this.verses.duplicationCommon.phoneAlreadyInUse);
      err.code = 'PHONE_ALREADY_IN_USE';
    }
    return err;
  }

  failable(originalErrorObject, extraData) {
    let errorObject = this._translateKnownError(originalErrorObject);
    errorObject = this._stringifyErrorObject(errorObject);
    errorObject = this._hideRestrictedErrorsOnProduction(errorObject);
    this.logger.silent('error', originalErrorObject);
    this.logger.silent('error-response', errorObject);
    return errorObject;
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

}

exports.LegacyApi = LegacyApi;