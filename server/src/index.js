/* eslint no-console: 0 */

const { promisify } = require('./utils/promisify');
const { detectMode } = require('./utils/detect-mode');
const { parseCommandLineParameters } = require('./utils/command-line');

const { Server } = require('./server');
const { Logger } = require('./logger');
let { LegacyDatabase } = require('./legacy-database');
const { ConfigLoader } = require('./config-loader');
const { EmailService } = require('./email-service');
const { SmsService } = require('./sms-service');
const { TemplateManager } = require('./template-manager');
const { FixtureManager } = require('./fixture-manager');
const { DatabaseService } = require('./database-service');

let { UserRegisterApi } = require('./legacy-apis/user-register');
const { UserLoginApi } = require('./apis/user-login');
const { UserAssertApiKeyApi } = require('./apis/user-assert-api-key');
let { UserLogoutApi } = require('./legacy-apis/user-logout');
let { VerifyEmailApi } = require('./legacy-apis/verify-email');
let { VerifyPhoneApi } = require('./legacy-apis/verify-phone');
let { UserChangePasswordApi } = require('./legacy-apis/user-change-password');
let { UserEditProfileApi } = require('./legacy-apis/user-edit-profile');
let { UserSetEmailApi } = require('./legacy-apis/user-set-email');
let { UserResendVerificationSmsApi } = require('./legacy-apis/user-resend-verification-sms');
let { UserResendVerificationEmailApi } = require('./legacy-apis/user-resend-verification-email');

let { UserResetPasswordRequestApi } = require('./legacy-apis/user-reset-password--request');
let { UserResetPasswordGetTokenInfoApi } = require('./legacy-apis/user-reset-password--get-token-info');
let { UserResetPasswordConfirmApi } = require('./legacy-apis/user-reset-password--confirm');

let { AddOrganizationApi } = require('./legacy-apis/add-organization');
let { GetOrganizationListApi } = require('./legacy-apis/get-organization-list');
let { EditOrganizationApi } = require('./legacy-apis/edit-organization');

let { AddNewEmployeeApi } = require('./legacy-apis/add-new-employee');
let { FindUserApi } = require('./legacy-apis/find-user');
let { HireUserAsEmployeeApi } = require('./legacy-apis/hire-user-as-employee');
let { GetEmployeeListApi } = require('./legacy-apis/get-employee-list');
let { GetEmployeeApi } = require('./legacy-apis/get-employee');
let { EditEmploymentApi } = require('./legacy-apis/edit-employment');
let { FireEmployeeApi } = require('./legacy-apis/fire-employee');

let { AddCustomerApi } = require('./legacy-apis/add-customer');
let { GetCustomerApi } = require('./legacy-apis/get-customer');
let { GetCustomerSummaryListApi } = require('./legacy-apis/get-customer-summary-list');
let { EditCustomerApi } = require('./legacy-apis/edit-customer');
let { AdjustCustomerBalanceApi } = require('./legacy-apis/adjust-customer-balance');
let { DeleteCustomerApi } = require('./legacy-apis/delete-customer');

let { AddOutletApi } = require('./legacy-apis/add-outlet');
let { GetOutletListApi } = require('./legacy-apis/get-outlet-list');
let { GetOutletApi } = require('./legacy-apis/get-outlet');
let { EditOutletApi } = require('./legacy-apis/edit-outlet');
let { DeleteOutletApi } = require('./legacy-apis/delete-outlet');

let { AddWarehouseApi } = require('./legacy-apis/add-warehouse');
let { GetWarehouseListApi } = require('./legacy-apis/get-warehouse-list');
let { GetWarehouseApi } = require('./legacy-apis/get-warehouse');
let { EditWarehouseApi } = require('./legacy-apis/edit-warehouse');
let { DeleteWarehouseApi } = require('./legacy-apis/delete-warehouse');

let { AddProductCategoryApi } = require('./legacy-apis/add-product-category');
let { GetProductCategoryListApi } = require('./legacy-apis/get-product-category-list');
let { EditProductCategoryApi } = require('./legacy-apis/edit-product-category');
let { DeleteProductCategoryApi } = require('./legacy-apis/delete-product-category');

const { GetInventoryListApi } = require('./apis/get-inventory-list');
const { GetAggregatedInventoryDetailsApi } = require('./apis/get-aggregated-inventory-details');
let { AddProductToInventoryApi } = require('./apis/add-product-to-inventory');
const { TransferBetweenInventoriesApi } = require('./apis/transfer-between-inventories');

let { AddSalesApi } = require('./legacy-apis/add-sales');
let { GetSalesApi } = require('./legacy-apis/get-sales');
const { GetSalesListApi } = require('./apis/get-sales-list');
let { DiscardSalesApi } = require('./legacy-apis/discard-sales');

let { AddSalesReturnApi } = require('./legacy-apis/add-sales-return');
let { GetSalesReturnApi } = require('./legacy-apis/get-sales-return');
let { GetSalesReturnListApi } = require('./legacy-apis/get-sales-return-list');

let { GetDashboardSummaryApi } = require('./legacy-apis/get-dashboard-summary');

let { GetDesignationListApi } = require('./legacy-apis/get-designation-list');
let { GetRoleListApi } = require('./legacy-apis/get-role-list');
let { GetPrivilegeListApi } = require('./legacy-apis/get-privilege-list');

let { InternalStatus } = require('./legacy-apis/internal--status');

let { AdminLoginApi } = require('./legacy-apis/admin-login');
let { AdminGetOutgoingSmsListApi } = require('./legacy-apis/admin-get-outgoing-sms-list');
let { AdminSetOutgoingSmsStatusApi } = require('./legacy-apis/admin-set-outgoing-sms-status');
let { AdminGetAggregatedUserListApi } = require('./legacy-apis/admin-get-aggregated-user-list');
let { AdminSetUserBanningStatusApi } = require('./legacy-apis/admin-set-user-banning-status');

let { FixtureCollection } = require('./legacy-collections/fixture');
let { UserCollection } = require('./legacy-collections/user');
let { EmailVerificationRequestCollection } = require('./legacy-collections/email-verification-request');
let { PhoneVerificationRequestCollection } = require('./legacy-collections/phone-verification-request');
let { SessionCollection } = require('./legacy-collections/session');
let { OrganizationCollection } = require('./legacy-collections/organization');
let { EmploymentCollection } = require('./legacy-collections/employment');
let { CustomerCollection } = require('./legacy-collections/customer');
let { OutletCollection } = require('./legacy-collections/outlet');
let { WarehouseCollection } = require('./legacy-collections/warehouse');
let { ProductCategoryCollection } = require('./legacy-collections/product-category');
let { PasswordResetRequestCollection } = require('./legacy-collections/password-reset-request');
let { InventoryCollection } = require('./legacy-collections/inventory');
let { ProductCollection } = require('./legacy-collections/product');
let { SalesCollection } = require('./legacy-collections/sales');
let { SalesReturnCollection } = require('./legacy-collections/sales-return');
let { AdminSessionCollection } = require('./legacy-collections/admin-session');
let { OutgoingSmsCollection } = require('./legacy-collections/outgoing-sms');

let config, logger, legacyDatabase, server, emailService, smsService, templateManager, fixtureManager;

/** @type {DatabaseService} */
let database;

let mode = detectMode();
let params = parseCommandLineParameters();

class Program {

  constructor({ allowUnsafeApis = false, muteLogger = false }) {
    this.allowUnsafeApis = allowUnsafeApis;
    this.muteLogger = muteLogger;
  }

  // NOTE: Intended to be used during testing
  exposeLegacyDatabaseForTesting() {
    return legacyDatabase;
  }

  // NOTE: Intended to be used during testing or by process manager
  terminateServer() {
    console.log("Server Terminated Programmatically.");
    process.exit(0);
  }

  async initiateServer(callback) {
    try {
      config = ConfigLoader.getComputedConfig();
      server = new Server(config, mode);
      database = new DatabaseService(config.db);
      legacyDatabase = new LegacyDatabase(config.db);
      logger = new Logger(config.log, this.muteLogger);
      emailService = new EmailService(config, mode);
      smsService = new SmsService(config, legacyDatabase);
      templateManager = new TemplateManager(config);
      fixtureManager = new FixtureManager(config);
      await this.__initializeLogger();
      await this.__initializeLegacyDatabase();
      await this.__initializeDatabase();
      await this.__initializeComponents();
      if (params.validate) {
        await database.checkIntegrity(logger);
      }
      if (params.dryRun) {
        logger.log("Terminating server as it is a dry run.");
        process.exit(0);
      }
      await this.__initializeServer();
      await this.__initializeApis();
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  async __initializeLogger() {
    logger.initialize();
    logger.info(`(server)> ${config.baseName} Started in ${mode} mode.`);
    logger.info('(server)> logger initialized.');
    server.setLogger(logger);
  }

  async __initializeDatabase() {
    await database.initialize(config.db);
    logger.info('(server)> database services initialized.');
    server.setDatabase(database);
  }

  async __initializeLegacyDatabase() {
    await promisify(legacyDatabase, legacyDatabase.initialize);
    logger.info('(server)> legacyDatabase initialized.');
    legacyDatabase.registerCollection('fixture', FixtureCollection);
    legacyDatabase.registerCollection('user', UserCollection);
    legacyDatabase.registerCollection('emailVerificationRequest', EmailVerificationRequestCollection);
    legacyDatabase.registerCollection('phoneVerificationRequest', PhoneVerificationRequestCollection);
    legacyDatabase.registerCollection('session', SessionCollection);
    legacyDatabase.registerCollection('organization', OrganizationCollection);
    legacyDatabase.registerCollection('employment', EmploymentCollection);
    legacyDatabase.registerCollection('customer', CustomerCollection);
    legacyDatabase.registerCollection('outlet', OutletCollection);
    legacyDatabase.registerCollection('warehouse', WarehouseCollection);
    legacyDatabase.registerCollection('productCategory', ProductCategoryCollection);
    legacyDatabase.registerCollection('passwordResetRequest', PasswordResetRequestCollection);
    legacyDatabase.registerCollection('inventory', InventoryCollection);
    legacyDatabase.registerCollection('product', ProductCollection);
    legacyDatabase.registerCollection('sales', SalesCollection);
    legacyDatabase.registerCollection('salesReturn', SalesReturnCollection);
    legacyDatabase.registerCollection('adminSession', AdminSessionCollection);
    legacyDatabase.registerCollection('outgoingSms', OutgoingSmsCollection);
    server.setLegacyDatabase(legacyDatabase);
  }

  async __initializeComponents() {
    await fixtureManager.initialize(database);
    logger.info('(server)> fixtures initialized.');

    templateManager.initialize();
    logger.info('(server)> template manager initialized.');
    server.setTemplateManager(templateManager);

    await emailService.initialize(logger);
    logger.info('(server)> email services initialized.');
    server.setEmailService(emailService);

    await smsService.initialize(logger);
    logger.info('(server)> sms services initialized.');
    server.setSmsService(smsService);
  }

  async __initializeServer() {
    await server.initialize();
    logger.info('(server)> server initialized.');
  }

  async __initializeApis() {
    logger.info('(server)> registering APIs');
    server.registerGetApi('/verify-phone/:link', VerifyPhoneApi);
    server.registerGetApi('/verify-email/:link', VerifyEmailApi);
    server.registerGetApi('/internal--status', InternalStatus);
    server.registerPostApi('/api/user-register', UserRegisterApi);
    server.registerPostApi('/api/user-login', UserLoginApi);
    server.registerPostApi('/api/user-assert-api-key', UserAssertApiKeyApi);
    server.registerPostApi('/api/user-logout', UserLogoutApi);
    server.registerPostApi('/api/user-change-password', UserChangePasswordApi);
    server.registerPostApi('/api/user-edit-profile', UserEditProfileApi);
    server.registerPostApi('/api/user-set-email', UserSetEmailApi);
    server.registerPostApi('/api/user-resend-verification-sms', UserResendVerificationSmsApi);
    server.registerPostApi('/api/user-resend-verification-email', UserResendVerificationEmailApi);
    server.registerPostApi('/api/add-organization', AddOrganizationApi);
    server.registerPostApi('/api/get-organization-list', GetOrganizationListApi);
    server.registerPostApi('/api/edit-organization', EditOrganizationApi);
    server.registerPostApi('/api/add-customer', AddCustomerApi);
    server.registerPostApi('/api/get-customer', GetCustomerApi);
    server.registerPostApi('/api/get-customer-summary-list', GetCustomerSummaryListApi);
    server.registerPostApi('/api/edit-customer', EditCustomerApi);
    server.registerPostApi('/api/adjust-customer-balance', AdjustCustomerBalanceApi);
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
    server.registerPostApi('/api/get-inventory-list', GetInventoryListApi);
    server.registerPostApi('/api/get-aggregated-inventory-details', GetAggregatedInventoryDetailsApi);
    server.registerPostApi('/api/add-product-to-inventory', AddProductToInventoryApi);
    server.registerPostApi('/api/transfer-between-inventories', TransferBetweenInventoriesApi);
    server.registerPostApi('/api/get-designation-list', GetDesignationListApi);
    server.registerPostApi('/api/get-role-list', GetRoleListApi);
    server.registerPostApi('/api/get-privilege-list', GetPrivilegeListApi);
    server.registerPostApi('/api/add-sales', AddSalesApi);
    server.registerPostApi('/api/get-sales', GetSalesApi);
    server.registerPostApi('/api/get-sales-list', GetSalesListApi);
    server.registerPostApi('/api/discard-sales', DiscardSalesApi);
    server.registerPostApi('/api/add-sales-return', AddSalesReturnApi);
    server.registerPostApi('/api/get-sales-return', GetSalesReturnApi);
    server.registerPostApi('/api/get-sales-return-list', GetSalesReturnListApi);
    server.registerPostApi('/api/get-dashboard-summary', GetDashboardSummaryApi);
    server.registerPostApi('/api/hire-user-as-employee', HireUserAsEmployeeApi);
    server.registerPostApi('/api/find-user', FindUserApi);
    server.registerPostApi('/api/add-new-employee', AddNewEmployeeApi);
    server.registerPostApi('/api/get-employee-list', GetEmployeeListApi);
    server.registerPostApi('/api/get-employee', GetEmployeeApi);
    server.registerPostApi('/api/edit-employment', EditEmploymentApi);
    server.registerPostApi('/api/fire-employee', FireEmployeeApi);
    server.registerPostApi('/api/admin-login', AdminLoginApi);
    server.registerPostApi('/api/admin-get-outgoing-sms-list', AdminGetOutgoingSmsListApi);
    server.registerPostApi('/api/admin-set-outgoing-sms-status', AdminSetOutgoingSmsStatusApi);
    server.registerPostApi('/api/admin-get-aggregated-user-list', AdminGetAggregatedUserListApi);
    server.registerPostApi('/api/admin-set-user-banning-status', AdminSetUserBanningStatusApi);
  }

}

exports.Program = Program;
