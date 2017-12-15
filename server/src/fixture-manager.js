
let fslib = require('fs');
let { AsyncCollector } = require('baselib');
let pathlib = require('path')

class FixtureManager {

  constructor(config) {
    this.config = config;
  }

  _loadAndPrepareFixtures(database, cbfn) {
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
        database.findOne('fixture', { name: fixture.name }, (err, content) => {
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
            database.deleteOne('fixture',  { name: fixture.name }, (err, wasSuccessful)=>{
              if (err) return reject(err);
              let doc = {
                name: fixture.name,
                version: fixture.version,
                data
              };
              database.insertOne('fixture', doc, (err, wasSuccessful)=>{
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

  initialize(database, cbfn) {
    this._loadAndPrepareFixtures(database, cbfn);
  }
}

exports.FixtureManager = FixtureManager;