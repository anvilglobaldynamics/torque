
const { DatabaseEngine } = require('./database-engine');
const { UserCollection } = require('./collections/user');
const { SesssionCollection } = require('./collections/session');
const { PhoneVerificationRequestCollection } = require('./collections/phone-verification-request');
const { EmailVerificationRequestCollection } = require('./collections/email-verification-request');

class DatabaseService {

  constructor({ path, name }) {
    this.engine = new DatabaseEngine({ path, name });
  }

  async initialize() {
    await this.engine.initialize();
    this.user = new UserCollection(this.engine, this);
    this.session = new SesssionCollection(this.engine, this);
    this.phoneVerificationRequest = new PhoneVerificationRequestCollection(this.engine, this);
    this.emailVerificationRequest = new EmailVerificationRequestCollection(this.engine, this);
  }

}

exports.DatabaseService = DatabaseService;