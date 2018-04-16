/* eslint no-console: 0 */

let { promisify } = require('./utils/promisify');
let { detectMode } = require('./utils/detect-mode.js');

let { Server } = require('./server');
let { Logger } = require('./logger');
let { Database } = require('./database');
let { ConfigLoader } = require('./config-loader');
const { EmailService } = require('./email-service');
const { SmsService } = require('./sms-service');
let { TemplateManager } = require('./template-manager');
let { FixtureManager } = require('./fixture-manager');
const { DatabaseService } = require('./database-service');

let { UserRegisterApi } = require('./apis/user-register');
let { UserLoginApi } = require('./apis/user-login');
let { UserLogoutApi } = require('./apis/user-logout');
let { VerifyEmailApi } = require('./apis/verify-email');
let { VerifyPhoneApi } = require('./apis/verify-phone');
let { UserChangePasswordApi } = require('./apis/user-change-password');
let { UserEditProfileApi } = require('./apis/user-edit-profile');
let { UserSetEmailApi } = require('./apis/user-set-email');
let { UserResendVerificationSmsApi } = require('./apis/user-resend-verification-sms');
let { UserResendVerificationEmailApi } = require('./apis/user-resend-verification-email');

let { UserResetPasswordRequestApi } = require('./apis/user-reset-password--request');
let { UserResetPasswordGetTokenInfoApi } = require('./apis/user-reset-password--get-token-info');
let { UserResetPasswordConfirmApi } = require('./apis/user-reset-password--confirm');

let { AddOrganizationApi } = require('./apis/add-organization');
let { GetOrganizationListApi } = require('./apis/get-organization-list');
let { EditOrganizationApi } = require('./apis/edit-organization');

let { AddNewEmployeeApi } = require('./apis/add-new-employee');
let { FindUserApi } = require('./apis/find-user');
let { HireUserAsEmployeeApi } = require('./apis/hire-user-as-employee');
let { GetEmployeeListApi } = require('./apis/get-employee-list');
let { GetEmployeeApi } = require('./apis/get-employee');
let { EditEmploymentApi } = require('./apis/edit-employment');
let { FireEmployeeApi } = require('./apis/fire-employee');

let { AddCustomerApi } = require('./apis/add-customer');
let { GetCustomerApi } = require('./apis/get-customer');
let { GetCustomerSummaryListApi } = require('./apis/get-customer-summary-list');
let { EditCustomerApi } = require('./apis/edit-customer');
let { AdjustCustomerBalanceApi } = require('./apis/adjust-customer-balance');
let { DeleteCustomerApi } = require('./apis/delete-customer');

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

let { GetInventoryListApi } = require('./apis/get-inventory-list');
let { GetAggregatedInventoryDetailsApi } = require('./apis/get-aggregated-inventory-details');
let { AddProductToInventoryApi } = require('./apis/add-product-to-inventory');
let { TransferBetweenInventoriesApi } = require('./apis/transfer-between-inventories');

let { AddSalesApi } = require('./apis/add-sales');
let { GetSalesApi } = require('./apis/get-sales');
let { GetSalesListApi } = require('./apis/get-sales-list');
let { DiscardSalesApi } = require('./apis/discard-sales');

let { AddSalesReturnApi } = require('./apis/add-sales-return');
let { GetSalesReturnApi } = require('./apis/get-sales-return');
let { GetSalesReturnListApi } = require('./apis/get-sales-return-list');

let { GetDashboardSummaryApi } = require('./apis/get-dashboard-summary');

let { GetDesignationListApi } = require('./apis/get-designation-list');
let { GetRoleListApi } = require('./apis/get-role-list');
let { GetPrivilegeListApi } = require('./apis/get-privilege-list');

let { InternalStatus } = require('./apis/internal--status');

let { AdminLoginApi } = require('./apis/admin-login');
let { AdminGetOutgoingSmsListApi } = require('./apis/admin-get-outgoing-sms-list');
let { AdminSetOutgoingSmsStatusApi } = require('./apis/admin-set-outgoing-sms-status');
let { AdminGetAggregatedUserListApi } = require('./apis/admin-get-aggregated-user-list');
let { AdminSetUserBanningStatusApi } = require('./apis/admin-set-user-banning-status');

let { FixtureCollection } = require('./collections/fixture');
let { UserCollection } = require('./collections/user');
let { EmailVerificationRequestCollection } = require('./collections/email-verification-request');
let { PhoneVerificationRequestCollection } = require('./collections/phone-verification-request');
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
let { SalesCollection } = require('./collections/sales');
let { SalesReturnCollection } = require('./collections/sales-return');
let { AdminSessionCollection } = require('./collections/admin-session');
let { OutgoingSmsCollection } = require('./collections/outgoing-sms');

let config, logger, database, server, emailService, smsService, templateManager, fixtureManager;

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

  async __initializeLogger() {
    await logger.initialize();
    logger.info(`(server)> ${config.baseName} Started in ${mode} mode.`);
    logger.info('(server)> logger initialized.');
    server.setLogger(logger);
  }

  async __initializeDatabase() {
    await promisify(database, database.initialize);
    logger.info('(server)> database initialized.');
    database.registerCollection('fixture', FixtureCollection);
    database.registerCollection('user', UserCollection);
    database.registerCollection('emailVerificationRequest', EmailVerificationRequestCollection);
    database.registerCollection('phoneVerificationRequest', PhoneVerificationRequestCollection);
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
    database.registerCollection('sales', SalesCollection);
    database.registerCollection('salesReturn', SalesReturnCollection);
    database.registerCollection('adminSession', AdminSessionCollection);
    database.registerCollection('outgoingSms', OutgoingSmsCollection);
    server.setDatabase(database);
  }

  async __initializeComponents() {
    await promisify(fixtureManager, fixtureManager.initialize, database);
    logger.info('(server)> fixtures initialized.');

    await promisify(templateManager, templateManager.initialize);
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
    await promisify(server, server.initialize);
    logger.info('(server)> server initialized.');
  }

  async __initializeApis() {
    logger.info('(server)> registering APIs');
    server.registerGetApi('/verify-phone/:link', VerifyPhoneApi);
    server.registerGetApi('/verify-email/:link', VerifyEmailApi);
    server.registerGetApi('/internal--status', InternalStatus);
    server.registerPostApi('/api/user-register', UserRegisterApi);
    server.registerPostApi('/api/user-login', UserLoginApi);
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

  async initiateServer(callback) {
    try {
      config = await promisify(ConfigLoader, ConfigLoader.getComputedConfig, this.muteLogger, mode);
      server = new Server(config, mode);
      database = new Database(config.db);
      logger = new Logger(config.log, this.muteLogger);
      emailService = new EmailService(config, mode);
      smsService = new SmsService(config, database);
      templateManager = new TemplateManager(config);
      fixtureManager = new FixtureManager(config);
      await this.__initializeLogger();
      await this.__initializeDatabase();
      await this.__initializeComponents();
      await this.__initializeServer();
      await this.__initializeApis();
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

}

exports.Program = Program;


