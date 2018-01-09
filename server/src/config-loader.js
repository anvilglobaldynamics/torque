/* eslint no-console: 0 */

let pathlib = require("path");
let userHomeDir = require('user-home');
let fslib = require('fs');

class ConfigLoader {

  static get _configSchema() {
    return Joi.object().keys({
      branding: Joi.object().keys({
        name: Joi.string().max(1024).required(),
        serverUrl: Joi.string().max(1024).required(),
        clientUrl: Joi.string().max(1024).required(),
        author: Joi.string().max(1024).required(),
        supportPhone: Joi.string().max(1024).required(),
        supportEmail: Joi.string().max(1024).required(),
      }),
      baseName: Joi.string().max(1024).required(),
      hostname: Joi.string().max(1024).required(),
      port: Joi.number().max(65535).required(),
      websocketPort: Joi.number().max(65535).required(),
      log: Joi.object().keys({
        logStandardOutputToFile: Joi.boolean().required(),
        logErrorOutputToFile: Joi.boolean().required(),
        logStandardOutputToConsole: Joi.boolean().required(),
        logErrorOutputToConsole: Joi.boolean().required(),
        patchConsoleObject: Joi.boolean().required(),
        dir: Joi.string().max(1024).required(),
        format: Joi.string().max(1024).required(),
      }),
      db: Joi.object().keys({
        path: Joi.boolean().required(),
      }),
      email: Joi.object().keys({
        enabled: Joi.boolean().required(),
        publicKey: Joi.string().max(1024).required(),
        privateKey: Joi.string().max(1024).required(),
        domain: Joi.string().max(1024).required(),
        from: Joi.string().max(1024).required(),
      }),
      sms: Joi.object().keys({
        enabled: Joi.boolean().required(),
        from: Joi.string().max(1024).required(),
      })
    });
  }

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
    let error;
    ({ error, config }) = Joi.validate(config, this._configSchema);
    return [(error || null), config];
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