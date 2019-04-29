
const { DatabaseEngine } = require('./database-engine');

const { Collection } = require('./collection-base');

const { AdminSessionCollection } = require('./collections/admin-session');
const { CustomerCollection } = require('./collections/customer');
const { EmailVerificationRequestCollection } = require('./collections/email-verification-request');
const { EmploymentCollection } = require('./collections/employment');
const { FixtureCollection } = require('./collections/fixture');
const { InventoryCollection } = require('./collections/inventory');
const { OrganizationCollection } = require('./collections/organization');
const { OutgoingSmsCollection } = require('./collections/outgoing-sms');
const { OutgoingEmailCollection } = require('./collections/outgoing-email');
const { OutletCollection } = require('./collections/outlet');
const { PasswordResetRequestCollection } = require('./collections/password-reset-request');
const { PhoneVerificationRequestCollection } = require('./collections/phone-verification-request');
const { ProductBlueprintCollection } = require('./collections/product-blueprint');
const { ProductCollection } = require('./collections/product');
const { SalesReturnCollection } = require('./collections/sales-return');
const { SalesCollection } = require('./collections/sales');
const { SesssionCollection } = require('./collections/session');
const { UserCollection } = require('./collections/user');
const { WarehouseCollection } = require('./collections/warehouse');
const { ProductAcquisitionCollection } = require('./collections/product-acquisition');
const { ProductTransferCollection } = require('./collections/product-transfer');
const { PackageActivationCollection } = require('./collections/package-activation');
const { ServiceBlueprintCollection } = require('./collections/service-blueprint');
const { ServiceCollection } = require('./collections/service');
const { ServiceMembershipCollection } = require('./collections/service-membership');
const { ModuleActivationCollection } = require('./collections/module-activation');
const { DiscountPresetCollection } = require('./collections/discount-preset');
const { CacheOutletGeolocationCollection } = require('./collections/cache-outlet-geolocation');

class DatabaseService {

  constructor({ path, name }) {
    this.engine = new DatabaseEngine({ path, name });
  }

  async initialize() {
    await this.engine.initialize();
    this.adminSession = new AdminSessionCollection(this.engine, this);
    this.customer = new CustomerCollection(this.engine, this);
    this.emailVerificationRequest = new EmailVerificationRequestCollection(this.engine, this);
    this.employment = new EmploymentCollection(this.engine, this);
    this.fixture = new FixtureCollection(this.engine, this);
    this.inventory = new InventoryCollection(this.engine, this);
    this.organization = new OrganizationCollection(this.engine, this);
    this.outgoingSms = new OutgoingSmsCollection(this.engine, this);
    this.outgoingEmail = new OutgoingEmailCollection(this.engine, this);
    this.outlet = new OutletCollection(this.engine, this);
    this.passwordResetRequest = new PasswordResetRequestCollection(this.engine, this);
    this.phoneVerificationRequest = new PhoneVerificationRequestCollection(this.engine, this);
    this.productBlueprint = new ProductBlueprintCollection(this.engine, this);
    this.product = new ProductCollection(this.engine, this);
    this.salesReturn = new SalesReturnCollection(this.engine, this);
    this.sales = new SalesCollection(this.engine, this);
    this.sesssion = new SesssionCollection(this.engine, this);
    this.user = new UserCollection(this.engine, this);
    this.warehouse = new WarehouseCollection(this.engine, this);
    this.productAcquisition = new ProductAcquisitionCollection(this.engine, this);
    this.productTransfer = new ProductTransferCollection(this.engine, this);
    this.packageActivation = new PackageActivationCollection(this.engine, this);
    this.serviceBlueprint = new ServiceBlueprintCollection(this.engine, this);
    this.service = new ServiceCollection(this.engine, this);
    this.serviceMembership = new ServiceMembershipCollection(this.engine, this);
    this.moduleActivation = new ModuleActivationCollection(this.engine, this);
    this.discountPreset = new DiscountPresetCollection(this.engine, this);
    this.cacheOutletGeolocation = new CacheOutletGeolocationCollection(this.engine, this);
    /** @type {[Collection]} */
    this.collectionList = Object.keys(this).filter(key => this[key] instanceof Collection).map(key => this[key]);
  }

  async checkIntegrity(logger) {
    logger.log("Database Integrity Check Started.");
    for (let collection of this.collectionList) {
      logger.log("Checking:", collection.name);
      let { issues } = await collection.checkIntegrity(logger);
      logger.log(`Found ${issues.length} issues.`);
      issues.forEach(({ doc, ex }) => {
        logger.log(doc);
        logger.log(ex);
      });
    }
    logger.log("Database Integrity Check Finished.");
  }

}

exports.DatabaseService = DatabaseService;