
let fslib = require('fs');
let { AsyncCollector } = require('baselib');
let pathlib = require('path')

class FixtureManager {

  constructor(config) {
    this.config = config;
  }

  _loadAndPrepareFixtures(legacyDatabase, cbfn) {
    let fixtureList = [
      {
        name: "designation-list",
        path: "./src/fixtures/designation-list.json",
        version: 1
      },
      {
        name: "role-list",
        path: "./src/fixtures/role-list.json",
        version: 1
      },
      {
        name: "privilege-list",
        path: "./src/fixtures/privilege-list.json",
        version: 1
      }
    ]

    Promise.all(fixtureList.map((fixture) => {
      return new Promise((accept, reject) => {
        legacyDatabase.findOne('fixture', { name: fixture.name }, (err, content) => {
          if (err) return reject(err);
          if (content !== null && content.version >= fixture.version) return accept();
          fslib.readFile(fixture.path, { encoding: 'utf8' }, (err, json)=>{
            if (err) return reject(err);
            let data;
            try {
              data = JSON.parse(json);
            } catch (ex){
              return reject(ex);
            }
            legacyDatabase.deleteOne('fixture',  { name: fixture.name }, (err, wasSuccessful)=>{
              if (err) return reject(err);
              let doc = {
                name: fixture.name,
                version: fixture.version,
                data
              };
              legacyDatabase.insertOne('fixture', doc, (err, wasSuccessful)=>{
                if (err) return reject(err);
                return accept();
              });
            });
          });
        });
      });
    })
    ).then(_ => {
      cbfn();
    }).catch(err => {
      cbfn(err);
    })
  }

  initialize(legacyDatabase, cbfn) {
    this._loadAndPrepareFixtures(legacyDatabase, cbfn);
  }
}

exports.FixtureManager = FixtureManager;