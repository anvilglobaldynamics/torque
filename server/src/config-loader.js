/* eslint no-console: 0 */

let pathlib = require("path");
let userHomeDir = require('user-home');
let fslib = require('fs');

class ConfigLoader {

  static get _defaultLocalFilePath() {
    return "./config.json";
  }

  static get _defaultUserLevelFilePath() {
    let homeDirPath = userHomeDir;
    if (homeDirPath === null) return null;
    return pathlib.join(homeDirPath, "/torque-config.json");
  }

  static _loadFromFile(file, cbfn) {
    fslib.readFile((file || 'NONEXISTENT'), { encoding: 'utf8' }, (err, data) => {
      if (err) return cbfn(err);
      cbfn(null, data);
    });
  }

  static _validateConfig(config) {
    if (!config) {
      return [(new Error("No config found"))];
    }
    try {
      config = JSON.parse(config);
    } catch (error) {
      return [error];
    }
    // TODO: Further validation
    return [null, config];
  }

  static _assimilateConfig(primary, secondary) {
    for (let key in secondary) {
      if (secondary.hasOwnProperty(key)) {
        if (!(key in primary)) {
          primary[key] = secondary[key];
        }
        if (typeof (primary[key]) === 'object' && typeof (secondary[key]) === 'object' && !Array.isArray(primary[key])) {
          this._assimilateConfig(primary[key], secondary[key]);
        }
      }
    }
    return primary;
  }

  static getComputedConfig(cbfn) {
    let config = {};
    let nonFatalErrorList = [];
    var validationError;
    this._loadFromFile(this._defaultUserLevelFilePath, (err, content) => {
      if (err) {
        nonFatalErrorList.push(err);
      } else {
        [validationError, content] = this._validateConfig(content);
        if (validationError) {
          nonFatalErrorList.push(validationError);
        } else {
          config = this._assimilateConfig(content, config);
        }
      }
      this._loadFromFile(this._defaultLocalFilePath, (err, content) => {
        if (err) {
          nonFatalErrorList.push(err);
        } else {
          [validationError, content] = this._validateConfig(content);
          if (validationError) {
            nonFatalErrorList.push(validationError);
          } else {
            config = this._assimilateConfig(config, content);
          }
        }
        config = this._assimilateConfig(config, this._defaultConfig);
        cbfn(null, [nonFatalErrorList, config]);
      });
    });
  }

  static reportErrorAndConfig(nonFatalErrorList, _config, mode) {
    if (nonFatalErrorList.length > 0) {
      console.log(`(config)> ${nonFatalErrorList.length} error(s) occurred during loading config. Default config will be applied.`);
      for (let nonFatalError of nonFatalErrorList) {
        console.error(nonFatalError);
      }
    }
    if (mode !== 'production') {
      console.log('(config)> Final config:\n', JSON.stringify(_config, null, 2));
    }
  }

}

exports.ConfigLoader = ConfigLoader;