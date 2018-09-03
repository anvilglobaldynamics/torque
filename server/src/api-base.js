
const Joi = require('joi');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const baselib = require('baselib');
const { CodedError, throwOnFalsy } = require('./utils/coded-error');
const { Server } = require('./server');
const { DatabaseService } = require('./database-service');
const { Logger } = require('./logger');

const languageCache = {
  'en-us': require('./languages/en-us').verses,
  'bn-bd': require('./languages/bn-bd').verses
};

const SESSION_DURATION_LIMIT = 15 * 24 * 60 * 60 * 1000;

class Api {

  static mixin(...mixinList) {
    let Class = Api;
    for (let mixin of mixinList) {
      Class = mixin(Class);
    }
    return Class;
  }

  /**
  * @param {Server} server
  * @param {DatabaseService} database
  * @param {Logger} logger
  */
  constructor(server, database, logger, request, response, socket, channel, requestUid = null, consumerId = null) {
    this.server = server;
    this.database = database;
    this.logger = logger;
    this._request = request;
    this._response = response;
    this._socket = socket;
    this._channel = channel;
    this._requestUid = requestUid;
    this.__paginationCache = null;
    this._consumerId = consumerId;
  }

  // region: properties (subclass needs to override) ==========

  // Set it to false to temporarily disable the API for everyone.
  get isEnabled() {
    return true;
  }

  // This is a Joi Schema
  get requestSchema() {
    return null;
  }

  get autoValidates() {
    return false;
  }

  get requiresAuthentication() {
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

  // Makes sure the organization has purchased a subscription. Works only if accessControl is provided and functional.
  get requiresSubscription() {
    return true;
  }

  get autoPaginates() {
    return false;
  }

  // region: internals ==========

  /** @private */
  _sendResponse(data) {
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

  /** @private */
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

  /** @private */
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

  /** @private */
  __detectLanguage(body) {
    if ('clientLanguage' in body) {
      this.clientLanguage = body.clientLanguage;
      delete body['clientLanguage'];
    } else {
      this.clientLanguage = 'en-us';
    }
    this.verses = languageCache[this.clientLanguage];
  }

  /** @private */
  __detectPagination(body) {
    if ('paginate' in body) {
      this.__paginationCache = body.paginate;
      delete body['paginate'];
    }
  }

  /** @private */
  async __handleAuthentication(body) {
    let { apiKey } = body;
    if (this.authenticationLevel === 'admin') {
      let username = await this.__authenticate(body);
      return { username, apiKey };
    } else {
      let userId = await this.__authenticate(body);
      await this.__enforceAccessControl(userId, body);
      await this.__handleSubscriptionVerification(body);
      return { userId, apiKey };
    }
  }

  

  /** @private */
  async _prehandle(originalBody) {
    try {
      if (!this.isEnabled) {
        throw new CodedError("API_DISABLED", "This action has been disabled by the developers. Please contact our call center for more information.");
      }
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
      if (typeof (response) !== 'object' || response === null) {
        throw new CodedError("DEVELOPER_ERROR", "Expected response to be an object.");
      }
      response.hasError = false;
      this.__applyPaginationToResponse(response);
      this._sendResponse(response);
    } catch (originalErrorObject) {
      this.logger.error(originalErrorObject);
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

  /** @private */
  async __authenticate(body) {
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

  /** @private */
  async __getOrganizationForAccessControlRule(userId, body, rule) {
    if (!('organizationBy' in rule)) {
      throw new CodedError("INVALID_RULE_IN_ACCESS_CONTROL", "Expecpted accessControl to have 'organizationBy'");
    }
    let { organizationBy } = rule;
    let organization;
    if (typeof (organizationBy) === "function") {
      organization = await organizationBy(this, userId, body);
      throwOnFalsy(organization, "ORGANIZATION_INVALID", "organizationBy function did not return valid organization.");
    } else if (typeof (organizationBy) === "string") {
      let id = body[organizationBy];
      organization = await this.database.organization.findById({ id });
      throwOnFalsy(organization, "ORGANIZATION_INVALID", "organizationBy string does not equal any organization id");
    } else {
      if (!Array.isArray(organizationBy)) {
        organizationBy = [organizationBy];
      }
      let queryObjectArray = organizationBy;
      for (let queryObject of queryObjectArray) {
        let { from, query, select } = queryObject;
        query = query(body);
        let doc = await this.database.engine.findOne(from, query);
        if (!doc || !(select in doc)) {
          if ('errorCode' in queryObject) {
            let message = `Access Control Rejection. Unable to locate ${select} from ${from}`;
            throw new CodedError(queryObject.errorCode, message);
          }
        }
        body[select] = doc[select];
      }
      let id = body[queryObjectArray[queryObjectArray.length - 1].select];
      organization = await this.database.organization.findById({ id });
      throwOnFalsy(organization, "ORGANIZATION_INVALID", this.verses.organizationCommon.organizationInvalid);
    }
    return organization;
  }

  /** @private */
  async __processAccessControlRule(userId, body, rule) {
    let organization = await this.__getOrganizationForAccessControlRule(userId, body, rule);
    let organizationId = organization.id;
    let employment = await this.database.employment.getLatestActiveEmploymentOfUserInOrganization({ userId, organizationId });
    if (!employment || !employment.isActive) {
      throw new CodedError("USER_NOT_EMPLOYED_BY_ORGANIZATION", this.verses.organizationCommon.userNotEmployedByOrganization);
    }
    let { privileges = [] } = rule;
    let unmetPrivileges = privileges.filter(privilege => !employment.privileges[privilege]);
    if (unmetPrivileges.length > 0) {
      let message = this.verses.accessControlCommon.accessControlUnmetPrivileges;
      message += unmetPrivileges.join(', ') + ".";
      err = new CodedError("ACCESS_CONTROL_UNMET_PRIVILEGES", message);
      err.privileges = unmetPrivileges;
      throw err;
    }
  }

  /** @private */
  async __enforceAccessControl(userId, body) {
    let rules = this.accessControl;
    if (!rules) return;
    await Promise.all(rules.map(rule => this.__processAccessControlRule(userId, body, rule)));
  }

  // region: error handling =========================================

  /** @private */
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

  /** @private */
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

  /** @private */
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

  // region: utility ==========================

  /**
  * @param {Object} param
  * @param {Array} param.source
  * @param {String} param.sourceKey
  * @param {Array} param.target
  * @param {String} param.targetKey
  * @param {Function} param.targetKey
  */
  async crossmap({ source, sourceKey, sourceKeyFn = null, target, onError = null, reuseMap = null } = {}) {
    const getSourceKeyValue = (sourceDoc) => {
      if (sourceKey) {
        return sourceDoc[sourceKey];
      } else {
        return sourceKeyFn(sourceDoc);
      }
    }
    let idList = source.map(sourceDoc => getSourceKeyValue(sourceDoc));
    let targetDocList = await this.database[target].listByIdList({ idList });

    /** @type {Map} */
    let map = (reuseMap ? reuseMap : new Map());

    if (targetDocList.length < idList.length) {
      idList.forEach(id => {
        if (!targetDocList.find(targetDoc => targetDoc.id === id)) {
          let sourceDoc = source.find(sourceDoc => getSourceKeyValue(sourceDoc) === id);
          if (onError) {
            let fallBack = onError(sourceDoc);
            map.set(sourceDoc, fallBack);
          }
        }
      })
    }

    source.forEach(sourceDoc => {
      let targetDoc = targetDocList.find(targetDoc => targetDoc.id === getSourceKeyValue(sourceDoc));
      map.set(sourceDoc, targetDoc);
    });
    return map;
  }

  ensureUpdate(wasUpdated, collectionName) {
    if (!wasUpdated) {
      err = new CodedError("GENERIC_UPDATE_FAILURE", this.verses.collectionCommon.genericUpdateFailureFn(collectionName));
      err.collectionName = collectionName;
      throw err;
    }
  }

}

exports.Api = Api;