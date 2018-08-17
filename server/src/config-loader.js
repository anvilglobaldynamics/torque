/* eslint no-console: 0 */

let pathlib = require("path");
let userHomeDir = require('user-home');
let fslib = require('fs');

const Joi = require('joi');

class ConfigLoader {

  static get _configSchema() {
    return Joi.object().keys({
      baseName: Joi.string().max(1024).required(),
      branding: Joi.object().keys({
        shortName: Joi.string().max(1024).required(),
        extendedName: Joi.string().max(1024).required(),
        serverUrl: Joi.string().max(1024).required(),
        clientUrl: Joi.string().max(1024).required(),
        authorName: Joi.string().max(1024).required(),
        authorWebsite: Joi.string().max(1024).required(),
        supportPhone: Joi.string().max(1024).required(),
        supportEmail: Joi.string().max(1024).required(),
      }),
      server: Joi.object().keys({
        hostname: Joi.string().max(1024).required(),
        port: Joi.number().max(65535).required(),
        websocketPort: Joi.number().max(65535).required(),
        ssl: Joi.object().keys({
          enabled: Joi.boolean().required(),
          key: Joi.string().max(1024).allow(null).required(),
          cert: Joi.string().max(1024).allow(null).required(),
          caBundle: Joi.string().max(1024).allow(null).required(),
        }).required(),
      }),
      log: Joi.object().keys({
        mirrorToFile: Joi.boolean().required(),
        dir: Joi.string().max(1024).required(),
        format: Joi.string().max(1024).required(),
      }),
      db: Joi.object().keys({
        path: Joi.string().max(1024).required(),
        name: Joi.string().max(1024).required()
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
      }),
      admin: Joi.object().keys({
        list: Joi.array().items({
          username: Joi.string().max(1024).required(),
          passwordHash: Joi.string().max(1024).required(),
          rights: Joi.object().keys({
            sendOutgoingSms: Joi.boolean().required(),
            viewUsersAndOrganizations: Joi.boolean().required(),
            banUsers: Joi.boolean().required(),
          }).required(),
        })
      }),
      socketProxy: Joi.object().keys({
        enabled: Joi.boolean().required(),
        url: Joi.string().max(1024).required(),
        pssk: Joi.string().max(1024).required(),
      }),
      "notes": Joi.array()
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

  static _loadFromFile(file) {
    return fslib.readFileSync((file || 'NONEXISTENT'), { encoding: 'utf8' })
  }

  static _doesFileExist(file) {
    try {
      fslib.statSync((file || 'NONEXISTENT'));
    } catch (ex) {
      return false;
    }
    return true;
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
    var { error, value: config } = Joi.validate(config, this._configSchema);
    return [(error || null), config];
  }

  static _readConfig(path, isMuted, mode) {
    let config = this._loadFromFile(path);
    let err;
    [err, config] = this._validateConfig(config);
    if (err) throw err;
    if (mode !== 'production' && !isMuted) {
      console.log('(config)> Final config:\n' + JSON.stringify(config, null, 2));
    }
    return config;
  }

  static getComputedConfig(isMuted, mode) {
    if (this._doesFileExist(this._defaultUserLevelFilePath)) {
      return this._readConfig(this._defaultUserLevelFilePath, isMuted, mode);
    } else {
      if (!isMuted) {
        console.log(`(config)> No user level config found at "${this._defaultUserLevelFilePath}". Falling back to default config.`);
      }
      return this._readConfig(this._defaultLocalFilePath, isMuted, mode);
    }
  }

}

exports.ConfigLoader = ConfigLoader;