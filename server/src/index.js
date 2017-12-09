
let { promisify } = require('./utils/promisify');
let { detectMode } = require('./utils/detect-mode.js');

let { Server } = require('./server');
let { Logger } = require('./logger');
let { Database } = require('./database');
let { ConfigLoader } = require('./config-loader');
let { EmailService } = require('./email-service');
let { SmsService } = require('./sms-service');
let { TemplateManager } = require('./template-manager');

let { UserRegisterApi } = require('./apis/user-register');
let { UserLoginApi } = require('./apis/user-login');
let { UserLogoutApi } = require('./apis/user-logout');
let { VerifyEmailApi } = require('./apis/verify-email');
let { UserChangePasswordApi } = require('./apis/user-change-password');
let { UserEditProfileApi } = require('./apis/user-edit-profile');

let { AddOrganizationApi } = require('./apis/add-organization');
let { GetrganizationListApi } = require('./apis/get-organization-list');
let { EditOrganizationApi } = require('./apis/edit-organization');

let { AddCustomerApi } = require('./apis/add-customer');
let { GetCustomerApi } = require('./apis/get-customer');
let { GetCustomerSummaryListApi } = require('./apis/get-customer-summary-list');
let { EditCustomerApi } = require('./apis/edit-customer');
let { DeleteCustomerApi } = require('./apis/delete-customer');
let { UserResetPasswordRequestApi } = require('./apis/user-reset-password--request');
let { UserResetPasswordGetTokenInfoApi } = require('./apis/user-reset-password--get-token-info');
let { UserResetPasswordConfirmApi } = require('./apis/user-reset-password--confirm');

let { AddOutletApi } = require('./apis/add-outlet');
let { GetOutletListApi } = require('./apis/get-outlet-list');
let { GetOutletApi } = require('./apis/get-outlet');
let { EditOutletApi } = require('./apis/edit-outlet');
let { DeleteOutletApi } = require('./apis/delete-outlet');

let { AddWarehouseApi } = require('./apis/add-warehouse');
let { GetWarehouseListApi } = require('./apis/get-warehouse-list');
let { GetWarehouseApi } = require('./apis/get-warehouse');
let { EditWarehouseApi } = require('./apis/edit-warehouse');
let { DeleteWarehouseApi } = require('./apis/delete-warehouse');

let { AddProductCategoryApi } = require('./apis/add-product-category');
let { GetProductCategoryListApi } = require('./apis/get-product-category-list');
let { EditProductCategoryApi } = require('./apis/edit-product-category');
let { DeleteProductCategoryApi } = require('./apis/delete-product-category');

let { GetAggregatedInventoryDetailsApi } = require('./apis/get-aggregated-inventory-details');
let { AddProductToInventoryApi } = require('./apis/add-product-to-inventory');
let { TransferBetweenInventoriesApi } = require('./apis/transfer-between-inventories');

let { UserCollection } = require('./collections/user');
let { EmailVerificationRequestCollection } = require('./collections/email-verification-request');
let { SessionCollection } = require('./collections/session');
let { OrganizationCollection } = require('./collections/organization');
let { EmploymentCollection } = require('./collections/employment');
let { CustomerCollection } = require('./collections/customer');
let { OutletCollection } = require('./collections/outlet');
let { WarehouseCollection } = require('./collections/warehouse');
let { ProductCategoryCollection } = require('./collections/product-category');
let { PasswordResetRequestCollection } = require('./collections/password-reset-request');
let { InventoryCollection } = require('./collections/inventory');
let { ProductCollection } = require('./collections/product');

let config, logger, database, server, emailService, smsService, templateManager;

let mode = detectMode();

class Program {

  constructor({ allowUnsafeApis = false, muteLogger = false }) {
    this.allowUnsafeApis = allowUnsafeApis;
    this.muteLogger = muteLogger;
  }

  // NOTE: Intended to be used during testing
  exposeDatabaseForTesting() {
    return database;
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
        emailService = new EmailService(config);
        smsService = new SmsService(config);
        templateManager = new TemplateManager(config);
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
        database.registerCollection('customer', CustomerCollection);
        database.registerCollection('outlet', OutletCollection);
        database.registerCollection('warehouse', WarehouseCollection);
        database.registerCollection('productCategory', ProductCategoryCollection);
        database.registerCollection('passwordResetRequest', PasswordResetRequestCollection);
        database.registerCollection('inventory', InventoryCollection);
        database.registerCollection('product', ProductCollection);
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
        server.registerPostApi('/api/user-change-password', UserChangePasswordApi);
        server.registerPostApi('/api/user-edit-profile', UserEditProfileApi);
        server.registerPostApi('/api/add-organization', AddOrganizationApi);
        server.registerPostApi('/api/get-organization-list', GetrganizationListApi);
        server.registerPostApi('/api/edit-organization', EditOrganizationApi);
        server.registerPostApi('/api/add-customer', AddCustomerApi);
        server.registerPostApi('/api/get-customer', GetCustomerApi);
        server.registerPostApi('/api/get-customer-summary-list', GetCustomerSummaryListApi);
        server.registerPostApi('/api/edit-customer', EditCustomerApi);
        server.registerPostApi('/api/delete-customer', DeleteCustomerApi);
        server.registerPostApi('/api/add-outlet', AddOutletApi);
        server.registerPostApi('/api/get-outlet-list', GetOutletListApi);
        server.registerPostApi('/api/get-outlet', GetOutletApi);
        server.registerPostApi('/api/edit-outlet', EditOutletApi);
        server.registerPostApi('/api/delete-outlet', DeleteOutletApi);
        server.registerPostApi('/api/add-warehouse', AddWarehouseApi);
        server.registerPostApi('/api/get-warehouse-list', GetWarehouseListApi);
        server.registerPostApi('/api/get-warehouse', GetWarehouseApi);
        server.registerPostApi('/api/edit-warehouse', EditWarehouseApi);
        server.registerPostApi('/api/delete-warehouse', DeleteWarehouseApi);
        server.registerPostApi('/api/add-product-category', AddProductCategoryApi);
        server.registerPostApi('/api/get-product-category-list', GetProductCategoryListApi);
        server.registerPostApi('/api/edit-product-category', EditProductCategoryApi);
        server.registerPostApi('/api/delete-product-category', DeleteProductCategoryApi);
        server.registerPostApi('/api/user-reset-password--request', UserResetPasswordRequestApi);
        server.registerPostApi('/api/user-reset-password--get-token-info', UserResetPasswordGetTokenInfoApi);
        server.registerPostApi('/api/user-reset-password--confirm', UserResetPasswordConfirmApi);
        server.registerPostApi('/api/get-aggregated-inventory-details', GetAggregatedInventoryDetailsApi);
        server.registerPostApi('/api/add-product-to-inventory', AddProductToInventoryApi);
        server.registerPostApi('/api/transfer-between-inventories', TransferBetweenInventoriesApi);
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


