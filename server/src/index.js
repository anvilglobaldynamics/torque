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

const { UserRegisterApi } = require('./apis/user-register');
const { UserLoginApi } = require('./apis/user-login');
const { UserAssertApiKeyApi } = require('./apis/user-assert-api-key');
const { UserLogoutApi } = require('./apis/user-logout');
let { VerifyEmailApi } = require('./legacy-apis/verify-email');
let { VerifyPhoneApi } = require('./legacy-apis/verify-phone');
const { UserChangePasswordApi } = require('./apis/user-change-password');
const { UserEditProfileApi } = require('./apis/user-edit-profile');
const { UserSetEmailApi } = require('./apis/user-set-email');
let { UserResendVerificationSmsApi } = require('./legacy-apis/user-resend-verification-sms');
let { UserResendVerificationEmailApi } = require('./legacy-apis/user-resend-verification-email');
const { UserAgreeToTocApi } = require('./apis/user-agree-to-toc');

let { UserResetPasswordRequestApi } = require('./legacy-apis/user-reset-password--request');
let { UserResetPasswordGetTokenInfoApi } = require('./legacy-apis/user-reset-password--get-token-info');
let { UserResetPasswordConfirmApi } = require('./legacy-apis/user-reset-password--confirm');

const { AddOrganizationApi } = require('./apis/add-organization');
const { GetOrganizationListApi } = require('./apis/get-organization-list');
const { EditOrganizationApi } = require('./apis/edit-organization');
const { GetActivatedPackageListApi } = require('./apis/get-activated-package-list');

const { AddNewEmployeeApi } = require('./apis/add-new-employee');
let { FindUserApi } = require('./legacy-apis/find-user');
let { HireUserAsEmployeeApi } = require('./legacy-apis/hire-user-as-employee');
const { GetEmployeeListApi } = require('./apis/get-employee-list');
let { GetEmployeeApi } = require('./legacy-apis/get-employee');
let { EditEmploymentApi } = require('./legacy-apis/edit-employment');
let { FireEmployeeApi } = require('./legacy-apis/fire-employee');
const { GetUserDisplayInformationApi } = require('./apis/get-user-display-information');

const { AddCustomerApi } = require('./apis/add-customer');
let { GetCustomerApi } = require('./legacy-apis/get-customer');
const { GetCustomerSummaryListApi } = require('./apis/get-customer-summary-list');
const { EditCustomerApi } = require('./apis/edit-customer');
const { WithdrawFromChangeWalletBalanceApi } = require('./apis/withdraw-from-change-wallet-balance');
let { DeleteCustomerApi } = require('./legacy-apis/delete-customer');

const { AddOutletApi } = require('./apis/add-outlet');
let { GetOutletListApi } = require('./legacy-apis/get-outlet-list');
let { GetOutletApi } = require('./legacy-apis/get-outlet');
const { EditOutletApi } = require('./apis/edit-outlet');
const { DeleteOutletApi } = require('./apis/delete-outlet');
const { GetOutletCategoryListApi } = require('./apis/get-outlet-category-list');

let { AddWarehouseApi } = require('./legacy-apis/add-warehouse');
let { GetWarehouseListApi } = require('./legacy-apis/get-warehouse-list');
let { GetWarehouseApi } = require('./legacy-apis/get-warehouse');
let { EditWarehouseApi } = require('./legacy-apis/edit-warehouse');
const { DeleteWarehouseApi } = require('./apis/delete-warehouse');

const { AddProductBlueprintApi } = require('./apis/add-product-blueprint');
const { BulkImportProductBlueprintsApi } = require('./apis/bulk-import-product-blueprints');
const { GetProductBlueprintListApi } = require('./apis/get-product-blueprint-list');
const { EditProductBlueprintApi } = require('./apis/edit-product-blueprint');
let { DeleteProductBlueprintApi } = require('./legacy-apis/delete-product-blueprint');

const { AddServiceBlueprintApi } = require('./apis/add-service-blueprint');
const { GetServiceBlueprintListApi } = require('./apis/get-service-blueprint-list');
const { EditServiceBlueprintApi } = require('./apis/edit-service-blueprint');
const { GetActiveServiceListApi } = require('./apis/get-active-service-list');
const { ModifyAvailabilityOfServiceListInOutletListApi } = require('./apis/modify-availability-of-service-list-in-outlet-list');
const { EditOutletServiceApi } = require('./apis/edit-outlet-service');

const { GetInventoryListApi } = require('./apis/get-inventory-list');
const { GetAggregatedInventoryDetailsApi } = require('./apis/get-aggregated-inventory-details');
const { ReportInventoryDetailsApi } = require('./apis/report-inventory-details');
const { ReportCollectionDetailsApi } = require('./apis/report-collection-details');
const { ReportProductSalesDetailsApi } = require('./apis/report-product-sales-details');
let { AddProductToInventoryApi } = require('./apis/add-product-to-inventory');
const { TransferBetweenInventoriesApi } = require('./apis/transfer-between-inventories');
const { GetProductTransferListApi } = require('./apis/get-product-transfer-list');
const { GetProductAcquisitionListApi } = require('./apis/get-product-acquisition-list');
const { GetProductApi } = require('./apis/get-product');

const { AddSalesApi } = require('./apis/add-sales');
const { AddAdditionalPaymentApi } = require('./apis/add-additional-payment');
const { GetSalesApi } = require('./apis/get-sales');
const { GetSalesListApi } = require('./apis/get-sales-list');
const { DiscardSalesApi } = require('./apis/discard-sales');
const { GetServiceMembershipListApi } = require('./apis/get-service-membership-list');
const { ResendSalesReceiptApi } = require('./apis/resend-sales-receipt');

const { AddSalesReturnApi } = require('./apis/add-sales-return');
let { GetSalesReturnApi } = require('./legacy-apis/get-sales-return');
const { GetSalesReturnListApi } = require('./apis/get-sales-return-list');

const { GetDashboardSummaryApi } = require('./apis/get-dashboard-summary');

let { GetDesignationListApi } = require('./legacy-apis/get-designation-list');
let { GetRoleListApi } = require('./legacy-apis/get-role-list');
let { GetPrivilegeListApi } = require('./legacy-apis/get-privilege-list');
const { AdminGetPackageListApi } = require('./apis/admin-get-package-list');

const { AddDiscountPresetApi } = require('./apis/add-discount-preset');
const { EditDiscountPresetApi } = require('./apis/edit-discount-preset');
const { DeleteDiscountPresetApi } = require('./apis/delete-discount-preset');
const { GetDiscountPresetListApi } = require('./apis/get-discount-preset-list');


const { AddPaymentMethodApi } = require('./apis/add-payment-method');
const { EditPaymentMethodApi } = require('./apis/edit-payment-method');
const { GetPaymentMethodListApi } = require('./apis/get-payment-method-list');

const { AddProductCategoryApi } = require('./apis/add-product-category');
const { EditProductCategoryApi } = require('./apis/edit-product-category');
const { GetProductCategoryListApi } = require('./apis/get-product-category-list');

const { GraphSalesTrendApi } = require('./apis/graph-sales-trend');
const { AddVendorApi } = require('./apis/add-vendor');
const { GetVendorListApi } = require('./apis/get-vendor-list');
const { EditVendorApi } = require('./apis/edit-vendor');

const { EditOrganizationSettingsApi } = require('./apis/edit-organization-settings');

const { ShopLocateNearbyOutletsApi } = require('./apis/shop-locate-nearby-outlets');
const { ShopGetOutletDetailsApi } = require('./apis/shop-get-outlet-details');

const { AddAccountApi } = require('./apis/add-account');
const { EditAccountApi } = require('./apis/edit-account');
const { GetAccountListApi } = require('./apis/get-account-list');
const { AddTransactionApi } = require('./apis/add-transaction');
const { GetTransactionListApi } = require('./apis/get-transaction-list');
const { EditTransactionApi } = require('./apis/edit-transaction');
const { ReportIncomeStatementApi } = require('./apis/report-income-statement');
const { ReportBalanceSheetApi } = require('./apis/report-balance-sheet');
const { ReportTrialBalanceApi } = require('./apis/report-trial-balance');

let { InternalStatusApi } = require('./legacy-apis/internal--status');

const { AdminLoginApi } = require('./apis/admin-login');
const { AdminGetOutgoingSmsListApi } = require('./apis/admin-get-outgoing-sms-list');
const { AdminSetOutgoingSmsStatusApi } = require('./apis/admin-set-outgoing-sms-status');
const { AdminGetOutgoingEmailListApi } = require('./apis/admin-get-outgoing-email-list');
const { AdminSetOutgoingEmailStatusApi } = require('./apis/admin-set-outgoing-email-status');
const { AdminGetAggregatedUserListApi } = require('./apis/admin-get-aggregated-user-list');
const { AdminSetUserBanningStatusApi } = require('./apis/admin-set-user-banning-status');
const { AdminSetUserOriginTypeApi } = require('./apis/admin-set-user-origin-type');
const { AdminGetOrganizationApi } = require('./apis/admin-get-organization');
const { AdminAssignPackageToOrganizationApi } = require('./apis/admin-assign-package-to-organization');
const { AdminListOrganizationPackagesApi } = require('./apis/admin-list-organization-packages');
const { AdminGetModuleListApi } = require('./apis/admin-get-module-list');
const { AdminListOrganizationModulesApi } = require('./apis/admin-list-organization-modules');
const { AdminSetModuleActivationStatusApi } = require('./apis/admin-set-module-activation-status');
const { AdminGetStatisticsApi } = require('./apis/admin-get-statistics');
const { AdminRunDevopsApi } = require('./apis/admin-run-devops');

const { LiteSendVerificationSmsApi } = require('./apis/lite-send-verification-sms');
const { LiteCheckVerificationTokenApi } = require('./apis/lite-check-verification-token');
const { LiteUserRegisterApi } = require('./apis/lite-user-register');
const { LiteAddSalesApi } = require('./apis/lite-add-sales');
const { LiteGetCustomerApi } = require('./apis/lite-get-customer');
const { LiteGetReceiptApi } = require('./apis/lite-get-receipt');
const { LiteUserEditProfileApi } = require('./apis/lite-user-edit-profile');

const { AnalyticsReportUrlHitApi } = require('./apis/analytics-report-url-hit');
const { AnalyticsReportUserLocationApi } = require('./apis/analytics-report-user-location');
const { AnalyticsReportPotentialUserApi } = require('./apis/analytics-report-potential-user');

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
let { ProductBlueprintCollection } = require('./legacy-collections/product-blueprint');
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

  // NOTE: Intended to be used during testing
  exposeDatabaseForTesting() {
    return database;
  }

  // NOTE: Intended to be used during testing or by process manager
  terminateServer() {
    console.log("Server Terminated Programmatically.");
    process.exit(0);
  }

  async initiateServer(callback) {
    try {
      config = ConfigLoader.getComputedConfig();
      if (params.db) {
        console.log(`WARN Using db "${params.db}"`);
        config.db.name = params.db;
      }

      server = new Server(config, mode);
      logger = new Logger(config.log, this.muteLogger);
      database = new DatabaseService(config.db);
      legacyDatabase = new LegacyDatabase(config.db);
      emailService = new EmailService(config, mode, database);
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
    legacyDatabase.registerCollection('productBlueprint', ProductBlueprintCollection);
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
    logger.info(`(server)> server initialized on port ${server._port}`);
  }

  async __initializeApis() {
    logger.info('(server)> registering APIs');
    server.registerGetApi('/verify-phone/:link', VerifyPhoneApi);
    server.registerGetApi('/verify-email/:link', VerifyEmailApi);
    server.registerGetApi('/internal--status', InternalStatusApi);
    server.registerPostApi('/api/user-register', UserRegisterApi);
    server.registerPostApi('/api/user-login', UserLoginApi);
    server.registerPostApi('/api/user-assert-api-key', UserAssertApiKeyApi);
    server.registerPostApi('/api/user-logout', UserLogoutApi);
    server.registerPostApi('/api/user-change-password', UserChangePasswordApi);
    server.registerPostApi('/api/user-edit-profile', UserEditProfileApi);
    server.registerPostApi('/api/user-set-email', UserSetEmailApi);
    server.registerPostApi('/api/user-resend-verification-sms', UserResendVerificationSmsApi);
    server.registerPostApi('/api/user-resend-verification-email', UserResendVerificationEmailApi);
    server.registerPostApi('/api/user-agree-to-toc', UserAgreeToTocApi);
    server.registerPostApi('/api/add-organization', AddOrganizationApi);
    server.registerPostApi('/api/get-organization-list', GetOrganizationListApi);
    server.registerPostApi('/api/edit-organization', EditOrganizationApi);
    server.registerPostApi('/api/get-activated-package-list', GetActivatedPackageListApi);
    server.registerPostApi('/api/add-customer', AddCustomerApi);
    server.registerPostApi('/api/get-customer', GetCustomerApi);
    server.registerPostApi('/api/get-customer-summary-list', GetCustomerSummaryListApi);
    server.registerPostApi('/api/edit-customer', EditCustomerApi);
    server.registerPostApi('/api/withdraw-from-change-wallet-balance', WithdrawFromChangeWalletBalanceApi);
    server.registerPostApi('/api/delete-customer', DeleteCustomerApi);
    server.registerPostApi('/api/add-outlet', AddOutletApi);
    server.registerPostApi('/api/get-outlet-list', GetOutletListApi);
    server.registerPostApi('/api/get-outlet', GetOutletApi);
    server.registerPostApi('/api/edit-outlet', EditOutletApi);
    server.registerPostApi('/api/delete-outlet', DeleteOutletApi);
    server.registerPostApi('/api/get-outlet-category-list', GetOutletCategoryListApi);
    server.registerPostApi('/api/add-warehouse', AddWarehouseApi);
    server.registerPostApi('/api/get-warehouse-list', GetWarehouseListApi);
    server.registerPostApi('/api/get-warehouse', GetWarehouseApi);
    server.registerPostApi('/api/edit-warehouse', EditWarehouseApi);
    server.registerPostApi('/api/delete-warehouse', DeleteWarehouseApi);
    server.registerPostApi('/api/add-product-blueprint', AddProductBlueprintApi);
    server.registerPostApi('/api/bulk-import-product-blueprints', BulkImportProductBlueprintsApi);
    server.registerPostApi('/api/get-product-blueprint-list', GetProductBlueprintListApi);
    server.registerPostApi('/api/edit-product-blueprint', EditProductBlueprintApi);
    server.registerPostApi('/api/delete-product-blueprint', DeleteProductBlueprintApi);
    server.registerPostApi('/api/user-reset-password--request', UserResetPasswordRequestApi);
    server.registerPostApi('/api/user-reset-password--get-token-info', UserResetPasswordGetTokenInfoApi);
    server.registerPostApi('/api/user-reset-password--confirm', UserResetPasswordConfirmApi);
    server.registerPostApi('/api/get-inventory-list', GetInventoryListApi);
    server.registerPostApi('/api/get-aggregated-inventory-details', GetAggregatedInventoryDetailsApi);
    server.registerPostApi('/api/report-inventory-details', ReportInventoryDetailsApi);
    server.registerPostApi('/api/report-collection-details', ReportCollectionDetailsApi);
    server.registerPostApi('/api/report-product-sales-details', ReportProductSalesDetailsApi);
    server.registerPostApi('/api/add-product-to-inventory', AddProductToInventoryApi);
    server.registerPostApi('/api/transfer-between-inventories', TransferBetweenInventoriesApi);
    server.registerPostApi('/api/get-product-transfer-list', GetProductTransferListApi);
    server.registerPostApi('/api/get-product-acquisition-list', GetProductAcquisitionListApi);
    server.registerPostApi('/api/get-product', GetProductApi);
    server.registerPostApi('/api/get-designation-list', GetDesignationListApi);
    server.registerPostApi('/api/get-role-list', GetRoleListApi);
    server.registerPostApi('/api/get-privilege-list', GetPrivilegeListApi);
    server.registerPostApi('/api/add-sales', AddSalesApi);
    server.registerPostApi('/api/add-additional-payment', AddAdditionalPaymentApi);
    server.registerPostApi('/api/get-sales', GetSalesApi);
    server.registerPostApi('/api/get-sales-list', GetSalesListApi);
    server.registerPostApi('/api/get-service-membership-list', GetServiceMembershipListApi);
    server.registerPostApi('/api/resend-sales-receipt', ResendSalesReceiptApi);

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
    server.registerPostApi('/api/get-user-display-information', GetUserDisplayInformationApi);
    server.registerPostApi('/api/add-discount-preset', AddDiscountPresetApi);
    server.registerPostApi('/api/edit-discount-preset', EditDiscountPresetApi);
    server.registerPostApi('/api/delete-discount-preset', DeleteDiscountPresetApi);
    server.registerPostApi('/api/get-discount-preset-list', GetDiscountPresetListApi);

    server.registerPostApi('/api/add-payment-method', AddPaymentMethodApi);
    server.registerPostApi('/api/edit-payment-method', EditPaymentMethodApi);
    server.registerPostApi('/api/get-payment-method-list', GetPaymentMethodListApi);

    server.registerPostApi('/api/add-product-category', AddProductCategoryApi);
    server.registerPostApi('/api/edit-product-category', EditProductCategoryApi);
    server.registerPostApi('/api/get-product-category-list', GetProductCategoryListApi);

    server.registerPostApi('/api/add-account', AddAccountApi);
    server.registerPostApi('/api/edit-account', EditAccountApi);
    server.registerPostApi('/api/get-account-list', GetAccountListApi);
    server.registerPostApi('/api/add-transaction', AddTransactionApi);
    server.registerPostApi('/api/get-transaction-list', GetTransactionListApi);
    server.registerPostApi('/api/edit-transaction', EditTransactionApi);
    server.registerPostApi('/api/report-income-statement', ReportIncomeStatementApi);
    server.registerPostApi('/api/report-balance-sheet', ReportBalanceSheetApi);
    server.registerPostApi('/api/report-trial-balance', ReportTrialBalanceApi);

    server.registerPostApi('/api/graph-sales-trend', GraphSalesTrendApi);
    server.registerPostApi('/api/add-vendor', AddVendorApi);
    server.registerPostApi('/api/get-vendor-list', GetVendorListApi);
    server.registerPostApi('/api/edit-vendor', EditVendorApi);

    server.registerPostApi('/api/edit-organization-settings', EditOrganizationSettingsApi);

    server.registerPostApi('/api/admin-login', AdminLoginApi);
    server.registerPostApi('/api/admin-get-outgoing-sms-list', AdminGetOutgoingSmsListApi);
    server.registerPostApi('/api/admin-set-outgoing-sms-status', AdminSetOutgoingSmsStatusApi);
    server.registerPostApi('/api/admin-get-outgoing-email-list', AdminGetOutgoingEmailListApi);
    server.registerPostApi('/api/admin-set-outgoing-email-status', AdminSetOutgoingEmailStatusApi);
    server.registerPostApi('/api/admin-get-aggregated-user-list', AdminGetAggregatedUserListApi);
    server.registerPostApi('/api/admin-set-user-banning-status', AdminSetUserBanningStatusApi);
    server.registerPostApi('/api/admin-set-user-origin-type', AdminSetUserOriginTypeApi);
    server.registerPostApi('/api/admin-get-organization', AdminGetOrganizationApi);
    server.registerPostApi('/api/admin-get-package-list', AdminGetPackageListApi);
    server.registerPostApi('/api/admin-assign-package-to-organization', AdminAssignPackageToOrganizationApi);
    server.registerPostApi('/api/admin-list-organization-packages', AdminListOrganizationPackagesApi);
    server.registerPostApi('/api/admin-get-statistics', AdminGetStatisticsApi);
    server.registerPostApi('/api/admin-run-devops', AdminRunDevopsApi);

    server.registerPostApi('/api/add-service-blueprint', AddServiceBlueprintApi);
    server.registerPostApi('/api/get-service-blueprint-list', GetServiceBlueprintListApi);
    server.registerPostApi('/api/edit-service-blueprint', EditServiceBlueprintApi);
    server.registerPostApi('/api/get-active-service-list', GetActiveServiceListApi);
    server.registerPostApi('/api/modify-availability-of-service-list-in-outlet-list', ModifyAvailabilityOfServiceListInOutletListApi);
    server.registerPostApi('/api/edit-outlet-service', EditOutletServiceApi);
    server.registerPostApi('/api/admin-get-module-list', AdminGetModuleListApi);
    server.registerPostApi('/api/admin-list-organization-modules', AdminListOrganizationModulesApi);
    server.registerPostApi('/api/admin-set-module-activation-status', AdminSetModuleActivationStatusApi);
    server.registerPostApi('/api/shop-locate-nearby-outlets', ShopLocateNearbyOutletsApi);
    server.registerPostApi('/api/shop-get-outlet-details', ShopGetOutletDetailsApi);

    server.registerPostApi('/api/lite-send-verification-sms', LiteSendVerificationSmsApi);
    server.registerPostApi('/api/lite-check-verification-token', LiteCheckVerificationTokenApi);
    server.registerPostApi('/api/lite-user-register', LiteUserRegisterApi);
    server.registerPostApi('/api/lite-add-sales', LiteAddSalesApi);
    server.registerPostApi('/api/lite-get-customer', LiteGetCustomerApi);
    server.registerPostApi('/api/lite-get-receipt', LiteGetReceiptApi);
    server.registerPostApi('/api/lite-user-edit-profile', LiteUserEditProfileApi);

    server.registerPostApi('/api/analytics-report-url-hit', AnalyticsReportUrlHitApi);
    server.registerPostApi('/api/analytics-report-user-location', AnalyticsReportUserLocationApi);
    server.registerPostApi('/api/analytics-report-potential-user', AnalyticsReportPotentialUserApi);

  }

}

exports.Program = Program;
