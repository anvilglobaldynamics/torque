/* eslint no-console: 0 */

const fslib = require('fs-extra');
const pathlib = require('path');
const moment = require('moment');
const utillib = require('util');
const YAML = require('js-yaml');

class Logger {

  _validateOptions(options) {
    let {
      mirrorToFile = false,
      dir = './temp-logs',
      format = 'json' // ignored.
    } = options;

    return {
      mirrorToFile,
      dir,
      format
    };
  }

  _parse(content) {
    return YAML.parse(content);
  }

  _stringify(content) {
    try {
      return YAML.safeDump(content, { skipInvalid: false });
    } catch (ex) {
      return YAML.safeDump({ jsonFallback: JSON.stringify(content) });
    }
  }

  constructor(options, isMuted = false) {
    this.options = this._validateOptions(options);
    this.isMuted = isMuted;
    this._mirrorFilePath = null;
  }

  _initializeFile() {
    let extension = 'yaml';
    let postfix = moment((new Date)).format('YYYY-MM-DD--HH.mm.ss.SSSS');
    let number = 0;
    let fileName = pathlib.join(this.options.dir, `log--${postfix}.${number}.${extension}`);
    while (fslib.existsSync(fileName)) {
      number += 1;
      fileName = pathlib.join(this.options.dir, `log--${postfix}.${number}.${extension}`);
    }
    this._mirrorFilePath = fileName;
    let header = {
      unixDatetimeStamp: (new Date()).getTime(),
      type: 'meta',
      data: {
        event: 'logging-started'
      }
    };
    fslib.writeFileSync(this._mirrorFilePath, this._stringify([header]), { encoding: 'utf8', flag: 'a' });
  }

  initialize() {
    if (this.options.mirrorToFile) {
      this._initializeFile();
    }
  }

  _commit(entry) {
    // TODO: queing mechanism.
    if (this._mirrorFilePath) {
      fslib.writeFileSync(this._mirrorFilePath, this._stringify([entry]), { encoding: 'utf8', flag: 'a' });
    }
  }

  silent(...args) {
    let entry = {
      unixDatetimeStamp: (new Date()).getTime(),
      type: 'log',
      data: args
    };
    this._commit(entry);
  }

  log(...args) {
    let entry = {
      unixDatetimeStamp: (new Date()).getTime(),
      type: 'log',
      data: args
    };
    this._commit(entry);
    if (!this.isMuted) {
      console.log.apply(console, args);
    }
  }

  important(...args) {
    let entry = {
      unixDatetimeStamp: (new Date()).getTime(),
      type: 'important',
      data: args
    };
    this._commit(entry);
    if (!this.isMuted) {
      console.log.apply(console, ['IMPORTANT'].concat(args));
    }
  }

  inspect(object) {
    console.log(utillib.inspect(object, { showHidden: true, depth: null }));
  }

  info(...args) {
    let entry = {
      unixDatetimeStamp: (new Date()).getTime(),
      type: 'info',
      data: args
    };
    this._commit(entry);
    if (!this.isMuted) {
      console.log.apply(console, ['INFO'].concat(args));
    }
  }

  error(err) {
    let entry = {
      unixDatetimeStamp: (new Date()).getTime(),
      type: 'error',
      original: err,
      name: err.name,
      code: err.code,
      stack: err.stack
    };
    this._commit(entry);
    if (!this.isMuted) {
      console.error(err);
    }
  }

  debug(...args) {
    let entry = {
      unixDatetimeStamp: (new Date()).getTime(),
      type: 'log',
      data: args
    };
    this._commit(entry);
    if (!this.isMuted) {
      console.log.apply(console, ['DEBUG'].concat(args));
    }
  }

}

exports.Logger = Logger;