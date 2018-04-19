
const { DatabaseEngine } = require('./database-engine');
const { UserCollection } = require('./collections/user');

class DatabaseService {

  constructor({ path, name }) {
    this.engine = new DatabaseEngine({ path, name });
  }

  async initialize() {
    await this.engine.initialize();
    this.user = new UserCollection(this.engine, this);
  }

}

exports.DatabaseService = DatabaseService;