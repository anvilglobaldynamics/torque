
let fslib = require('fs');
const { DatabaseService } = require('./database-service');
let pathlib = require('path');

class FixtureManager {

  constructor(config) {
    this.config = config;
  }

  /**
  *
  * @param {DatabaseService} database - An object.
  **/
  async _loadAndPrepareFixtures(database) {
    let fixtureList = [
      {
        name: "designation-list",
        path: "./src/fixtures/designation-list.json",
        version: 2
      },
      {
        name: "role-list",
        path: "./src/fixtures/role-list.json",
        version: 2
      },
      {
        name: "privilege-list",
        path: "./src/fixtures/privilege-list.json",
        version: 24
      },
      {
        name: "package-list",
        path: "./src/fixtures/package-list.json",
        version: 35
      },
      {
        name: "module-list",
        path: "./src/fixtures/module-list.json",
        version: 10
      },
      {
        name: "outlet-category-list",
        path: "./src/fixtures/outlet-category-list.json",
        version: 8
      }
    ];

    return await Promise.all(fixtureList.map(async (fixture) => {
      let content = await database.engine.findOne('fixture', { name: fixture.name });
      if (content !== null && content.version >= fixture.version) return;
      let json = fslib.readFileSync(fixture.path, { encoding: 'utf8' });
      let data = JSON.parse(json);
      await database.engine.deleteOne('fixture', { name: fixture.name });
      let doc = {
        name: fixture.name,
        version: fixture.version,
        data
      };
      await database.engine.insertOne('fixture', doc);
    }));
  }

  async initialize(database) {
    await this._loadAndPrepareFixtures(database);
  }

}

exports.FixtureManager = FixtureManager;
