
const Joi = require('joi');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const baselib = require('baselib');
const moment = require('moment');
const { CodedError, throwOnFalsy } = require('./utils/coded-error');
const { Server } = require('./server');
const { DatabaseService } = require('./database-service');
const { Logger } = require('./logger');
const { escapeRegExp } = require('./utils/escape-regexp');

const languageCache = {
  'en-us': require('./languages/en-us').verses,
  'bn-bd': require('./languages/bn-bd').verses
};

const SESSION_DURATION_LIMIT = 12 * 60 * 60 * 1000;

const _restrictedErrorCodeList = [
  "INTERNAL_SERVER_ERROR"
];

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
    this._consumerId = consumerId;
    this.__paginationCache = null;
    this.interimData = {
      organization: null, // NOTE: populated from accessControl
      aPackage: null // NOTE: populated from package subscription
    }
    this.verses = null;
    this.__assignFailsafeLanguageFeature();
  }

  __assignFailsafeLanguageFeature() {
    // NOTE: necessary in order to avoid some errors in production.
    this.clientLanguage = 'en-us';
    this.verses = languageCache[this.clientLanguage];
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

  get skipSubscriptionCheckOnTorqueLite() {
    return true;
  }

  /*
    enforces Access Control Rules. Rules are specified using the accessControl property. Format - 
    [
      {
        privilegeList: [ ...list of privileges ]
        organizationBy: "keyName" or <function> or <object>
        moduleCodeList: [ ...list of module codes ]
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

  __removeMongodbObjectIdReferrences(data) {
    const __fn = (object) => {
      if (typeof (object) === "object" && object !== null) {
        if (Array.isArray(object)) {
          for (let i = 0; i < object.length; i++) {
            __fn(object[i]);
          }
        } else {
          let keys = Object.keys(object);
          for (let i = 0; i < keys.length; i++) {
            if (keys[i] === '_id') {
              delete object[keys[i]];
              continue;
            }
            __fn(object[keys[i]]);
          }
        }
      }
      return object;
    }
    return __fn(data);
  }

  /** @private */
  _sendResponse(data) {
    data = this.__removeMongodbObjectIdReferrences(data);
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
      clientLanguage: Joi.string().valid('en-us', 'bn-bd').optional(),
      clientApplication: Joi.string().valid('torque', 'torque-lite').optional()
    });
    let { error, value } = this.validate(body, schema);
    if (error) throw error;
    return value;
  }

  /** @private */
  __detectClientApplication(body) {
    if ('clientApplication' in body) {
      this.clientApplication = body.clientApplication;
      delete body['clientApplication'];
    } else {
      this.clientApplication = 'torque';
    }
  }

  /** @private */
  __detectClientLanguage(body) {
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
  async __handleSubscriptionVerification(body) {
    // WARNING: Take extra care in modifying this function. It is reused by legacyApi using <Function>.call()
    if (!this.requiresSubscription) return;
    if (!('organizationId' in body)) {
      // NOTE: The following error should not be required. Since, every API call that does not take or infer organizationId
      // is essentially unable to use this.requiresSubscription = true and so, just returning should suffice.
      // Still, it is here in case it is needed.
      // throw new CodedError("DEV_ERROR", "api requires subscription but organizationId could not be looked up.");
      return;
    }
    if (this.clientApplication === 'torque-lite' && this.skipSubscriptionCheckOnTorqueLite) {
      console.log("SKIPPING SUBSCRIPTION VERIFICATION", this._request.url);
      return;
    }
    let organization = await this.database.organization.findById({ id: body.organizationId });
    if (!organization.packageActivationId) {
      throw new CodedError("SUBSCRIPTION_EXPIRED", "Your subscription has expired. (Never Assigned)");
    }
    let packageActivation = await this.database.packageActivation.findById({ id: organization.packageActivationId });
    throwOnFalsy(packageActivation, "DEV_ERROR", "packageActivation is missing");
    let aPackage = await this.database.fixture.findPackageByCode({ packageCode: packageActivation.packageCode });
    throwOnFalsy(aPackage, "DEV_ERROR", "package is missing");
    // Below is for future references, useful when limiting number of employees, etc.
    this.interimData.aPackage = aPackage;
    let { createdDatetimeStamp } = packageActivation;
    let { duration } = aPackage;
    let date = new Date(createdDatetimeStamp);
    date.setMonth(date.getMonth() + duration.months);
    date.setDate(date.getDate() + duration.days);
    let expirationDatetimeStamp = date.getTime();
    if (Date.now() > expirationDatetimeStamp) {
      throw new CodedError("SUBSCRIPTION_EXPIRED", "Your subscription has expired.");
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
        this.__detectClientApplication(body);
        this.__detectClientLanguage(body);
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
      this._stripInsecureFields(response);
      this._sendResponse(response);
    } catch (originalErrorObject) {
      this.logger.error(originalErrorObject);
      let errorObject = this._translateKnownError(originalErrorObject);
      errorObject = this._stringifyErrorObject(errorObject);
      errorObject = this._hideRestrictedErrorsOnProduction(errorObject);
      this._sendResponse({ hasError: true, error: errorObject });
    }
  }

  // region: security ==========================

  /** @private */
  async _increaseGlobalDailyUsageCount({ appName, useCase }) {
    const globalUsageCollectionName = 'auto-generated-global-daily-usage';

    const dateString = moment((new Date())).format('YYYY-MM-DD');
    const fieldName = appName + '--' + useCase;
    let query = {
      dateString,
      // fieldName
    };
    let modifications = {
      $inc: {
        [fieldName]: 1
      }
    };

    let doc = await this.database.engine.upsertAndReturnNew(globalUsageCollectionName, query, modifications);
    if (!doc) {
      throw new CodedError("INTERNAL_DATABASE_ERROR", `Unable to increase global daily usage of ${dateString}/${fieldName}`);
    }
    // console.log(`${dateString}/${fieldName}`, doc[fieldName]);
    return doc[fieldName];
  }

  // * Call this method from any API to enforce usage limit.
  // * useCase must be a string specified in the usageLimitMap below.
  // * This Api will throw an error "GLOBAL_USAGE_LIMIT_REACHED" if usage crosses
  //   the limit.
  async applyGlobalUsageLimit({ useCase }) {
    const usageLimitMap = {
      "register": {
        dailyLimit: {
          'torque': 1000,
          'torque-lite': 10000
        }
      },
      "add-sales": {
        dailyLimit: {
          'torque': 1000,
          'torque-lite': 10000
        }
      }
    };

    if (!(useCase in usageLimitMap)) throw new CodedError("DEV_ERROR", "Invalid Usecase for applying global usage limit");

    let count = await this._increaseGlobalDailyUsageCount({ appName: this.clientApplication, useCase });

    if (count > usageLimitMap[useCase].dailyLimit[this.clientApplication]) {
      // TODO: Send Email to Devs
      throw new CodedError("GLOBAL_USAGE_LIMIT_REACHED", "Global usage limit has been reached");
    }

  }

  _stripInsecureFields(response) {
    const fieldNameList = [
      'originApp'
    ];

    const _cleanup = function (object) {
      if (typeof (object) === "object" && object !== null) {
        if (Array.isArray(object)) {
          for (let i = 0; i < object.length; i++) {
            _cleanup(object[i]);
          }
        } else {
          let keys = Object.keys(object);
          for (let i = 0; i < keys.length; i++) {
            if (fieldNameList.indexOf(keys[i]) > -1) {
              delete object[keys[i]];
            } else {
              if (keys[i] !== '_id') {
                _cleanup(object[keys[i]]);
              }
            }
          }
        }
      }
    }

    _cleanup(response);
  }

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
      let session = await this.database.session.findByApiKey({ apiKey });
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
      organization = await organizationBy(userId, body, this);
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
        let { from, query: queryFn, select } = queryObject;
        let query = queryFn(body);
        if (Object.keys(query).length === 0) {
          throw new CodedError("DEV_ERROR", "accessControl: Query is invalid.");
        } else if (Object.keys(query).length > 1) {
          throw new CodedError("DEV_ERROR", "accessControl: Multikey query is not yet supported.");
        } else {
          let key = Object.keys(query).pop();
          if (typeof (query[key]) === 'undefined') {
            query = queryFn(this.interimData);
          }
        }
        let doc = await this.database.engine.findOne(from, query);
        if (!doc || !(select in doc)) {
          if ('errorCode' in queryObject) {
            let message = `Access Control Rejection. Unable to locate ${select} from ${from}`;
            throw new CodedError(queryObject.errorCode, message);
          }
        }
        this.interimData[select] = doc[select];
      }
      let id = this.interimData[queryObjectArray[queryObjectArray.length - 1].select];
      organization = await this.database.organization.findById({ id });
      throwOnFalsy(organization, "ORGANIZATION_INVALID", this.verses.organizationCommon.organizationInvalid);
    }
    return organization;
  }

  /** @private */
  async __processModuleActivationValidation({ organization, rule }) {
    // NOTE: this assignment has direct impact on module related validations.
    this.interimData.organization = organization;
    let { moduleList } = rule;
    if (!moduleList || moduleList.length === 0) return;
    await this.ensureModule(...moduleList);
  }

  /** @private */
  async __processAccessControlRule(userId, body, rule) {
    let organization = await this.__getOrganizationForAccessControlRule(userId, body, rule);
    await this.__processModuleActivationValidation({ organization, rule });
    let organizationId = organization.id;
    let employment = await this.database.employment.getLatestActiveEmploymentOfUserInOrganization({ userId, organizationId });
    if (!employment || !employment.isActive) {
      throw new CodedError("USER_NOT_EMPLOYED_BY_ORGANIZATION", this.verses.organizationCommon.userNotEmployedByOrganization);
    }
    let { privilegeList = [] } = rule;
    let unmetPrivileges = privilegeList.filter(privilege => !employment.privileges[privilege]);
    if (unmetPrivileges.length > 0) {
      let message = this.verses.accessControlCommon.accessControlUnmetPrivileges;
      message += unmetPrivileges.join(', ') + ".";
      let err = new CodedError("ACCESS_CONTROL_UNMET_PRIVILEGES", message);
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
    let rowNumber = errorObject.rowNumber;
    let cellNumber = errorObject.cellNumber;
    return { code, message, stack, details, rowNumber, cellNumber };
  }

  /** @private */
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

  /** @private */
  _translateKnownError(err) {
    if (!('code' in err)) return err;
    if (err.code === "DUPLICATE_email") {
      err = new Error(this.verses.duplicationCommon.emailAlreadyInUse);
      err.code = 'EMAIL_ALREADY_IN_USE';
    } else if (err.code === "DUPLICATE_organizationId+email") {
      err = new Error(this.verses.duplicationCommon.emailAlreadyInUse);
      err.code = 'EMAIL_ALREADY_IN_USE';
    } else if (err.code === "DUPLICATE_phone") {
      err = new Error(this.verses.duplicationCommon.phoneAlreadyInUse);
      err.code = 'PHONE_ALREADY_IN_USE';
    } else if (err.code === "DUPLICATE_organizationId+phone") {
      err = new Error(this.verses.duplicationCommon.phoneAlreadyInUse);
      err.code = 'PHONE_ALREADY_IN_USE';
    } else if (err.code === "DUPLICATE_organizationId+phone+email") {
      err = new Error(this.verses.duplicationCommon.emailOrPhoneAlreadyInUse);
      err.code = 'PHONE_OR_EMAIL_ALREADY_IN_USE';
    }
    return err;
  }

  // region: utility ==========================

  async hasModule(...moduleCodeClauseList) {
    try {
      return await this.ensureModule(...moduleCodeClauseList);
    } catch (ex) {
      if (ex.code === 'UNMET_MODULE') {
        return false;
      }
      throw ex;
    }
  }

  async ensureModule(...moduleCodeClauseList) {
    const moduleList = await this.database.fixture.getModuleList();
    let { organization } = this.interimData;
    throwOnFalsy(organization, "NO_ORGANIZATION_TO_LOOKUP_MODULE", "This API does not resolve an organization and so can not use modules.");

    let err = null;
    const didAnyPass = moduleCodeClauseList.some(moduleCodeClause => {
      let innerErr = null;
      moduleCodeClause.split('+').forEach(moduleCode => {
        const isModuleValid = moduleList.find(aModule => aModule.code === moduleCode);
        throwOnFalsy(isModuleValid, "DEV_ERROR", `"${moduleCode}" is not a valid module code.`);

        const isModuleActivated = (organization.activeModuleCodeList.includes(moduleCode));
        if (!isModuleActivated) {
          innerErr = new CodedError("UNMET_MODULE", `This feature requires "${moduleCode}" module which is not activated for this organization.`);
          innerErr.moduleCodeClause = moduleCodeClause;
        }
      });
      if (innerErr) {
        err = innerErr;
        return false;
      }
      return true;
    });

    if (!didAnyPass) {
      if (!err) {
        err = new CodedError("DEV_ERROR", "Invalid arguments for ensureModule().");
      }
      throw err;
    }

    return true;
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

  round(number) {
    return (Math.round(number * 100) / 100);
  }

  escapeRegExp(str) {
    return escapeRegExp(str);
  }

}

exports.Api = Api;