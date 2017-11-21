
let { promisify } = require('./utils/promisify');
let { detectMode } = require('./utils/detect-mode.js');

let { Server } = require('./server');
let { Logger } = require('./logger');
let { Database } = require('./database');
let { ConfigLoader } = require('./config-loader');
let { EmailService } = require('./email-service');
let { TemplateManager } = require('./template-manager');

let { UserRegisterApi } = require('./apis/user-register');
let { UserLoginApi } = require('./apis/user-login');
let { UserLogoutApi } = require('./apis/user-logout');
let { VerifyEmailApi } = require('./apis/verify-email');
let { AddOrganizationApi } = require('./apis/add-organization');

let { UserCollection } = require('./collections/user');
let { EmailVerificationRequestCollection } = require('./collections/email-verification-request');
let { SessionCollection } = require('./collections/session');
let { OrganizationCollection } = require('./collections/organization');
let { EmploymentCollection } = require('./collections/employment');

let config, logger, database, server, emailService, templateManager;

let mode = detectMode();

class Program {

  constructor({ allowUnsafeApis = false, muteLogger = false }) {
    this.allowUnsafeApis = allowUnsafeApis;
    this.muteLogger = muteLogger;
  }

  // NOTE: Intended to be used during testing
  deleteDocByIdFromDb(collection, id, callback) {
    database.deleteMany(collection, { id }, callback);
  }

  // NOTE: Intended to be used during testing or by process manager
  terminateServer() {
    console.log("Server Terminated Programmatically.");
    process.exit(0);
  }

  initiateServer(callback) {
    Promise.resolve()
      .then(() => {
        return promisify(ConfigLoader, ConfigLoader.getComputedConfig);
      })
      .then(([nonFatalErrorList, _config]) => {
        if (!this.muteLogger) {
          ConfigLoader.reportErrorAndConfig(nonFatalErrorList, _config, mode);
        }
        config = _config;
        return Promise.resolve();
      })
      .then(() => {
        server = new Server(config, mode);
        database = new Database(config.db.path);
        logger = new Logger(config.log, this.muteLogger);
        emailService = new EmailService(config.email);
        templateManager = new TemplateManager();
        return promisify(logger, logger.initialize);
      })
      .then(() => {
        logger.info(`(server)> ${config.baseName} Started in ${mode} mode.`);
        logger.info('(server)> logger initialized.');
        server.setLogger(logger);
        return Promise.resolve();
      })
      .then(() => {
        return promisify(database, database.initialize);
      })
      .then(() => {
        logger.info('(server)> database initialized.');
        database.registerCollection('user', UserCollection);
        database.registerCollection('emailVerificationRequest', EmailVerificationRequestCollection);
        database.registerCollection('session', SessionCollection);
        database.registerCollection('organization', OrganizationCollection);
        database.registerCollection('employment', EmploymentCollection);
        server.setDatabase(database);
        return Promise.resolve();
      })
      .then(() => {
        logger.info('(server)> initializing server.')
        return promisify(server, server.initialize);
      })
      .then(() => {
        logger.info('(server)> server initialized.')
        return Promise.resolve();
      })
      .then(() => {
        logger.info('(server)> registering APIs');
        server.registerGetApi('/verify-email/:link', VerifyEmailApi);
        server.registerPostApi('/api/user-register', UserRegisterApi);
        server.registerPostApi('/api/user-login', UserLoginApi);
        server.registerPostApi('/api/user-logout', UserLogoutApi);
        server.registerPostApi('/api/add-organization', AddOrganizationApi);
        return Promise.resolve();
      })
      .then(() => {
        return promisify(templateManager, templateManager.initialize);
      })
      .then(() => {
        logger.info('(server)> template manager initialized.')
        server.setTemplateManager(templateManager);
        return Promise.resolve();
      })
      .then(() => {
        return promisify(emailService, emailService.initialize, logger);
      })
      .then(() => {
        logger.info('(server)> email services initialized.')
        server.setEmailService(emailService);
        callback();
        return Promise.resolve();
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  }

}

exports.Program = Program;


