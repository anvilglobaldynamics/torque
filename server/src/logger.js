/* eslint no-console: 0 */

let fslib = require('fs');
let pathlib = require('path');
let mkpath = require('mkpath');
let YAML = require('yamljs');
let moment = require('moment');
let utillib = require('util');

class Logger {

  _validateOptions(options) {
    let {
      logStandardOutputToFile = true,
      logErrorOutputToFile = true,
      logStandardOutputToConsole = true,
      logErrorOutputToConsole = true,
      patchConsoleObject = false,
      dir = './temp-logs',
      format = 'json'
    } = options;

    let extension = 'txt';
    if (format === 'json') {
      extension = 'json';
    } else if (format === 'yaml') {
      extension = 'yaml';
    }
    let postfix = moment((new Date)).format('YYYY-MM-DD--HH.mm.ss.SSSS');
    let fileName = `log--${postfix}.${extension}`;
    let filePath = pathlib.join(dir, fileName);

    return {
      logStandardOutputToFile,
      logErrorOutputToFile,
      logStandardOutputToConsole,
      logErrorOutputToConsole,
      patchConsoleObject,
      dir,
      format,
      filePath
    };
  }

  constructor(options, isMuted = false) {
    this.options = this._validateOptions(options);
    this.inInCommit = false;
    this.isMuted = isMuted;
  }

  _parse(content) {
    if (this.options.format === 'json') {
      return JSON.parse(content);
    } else if (this.options.format === 'yaml') {
      return YAML.parse(content);
    }
    return content;
  }

  _stringify(content) {
    if (this.options.format === 'json') {
      return JSON.stringify(content);
    } else if (this.options.format === 'yaml') {
      return YAML.stringify(content);
    }
    return content;
  }

  initialize(cbfn) {
    if (this.options.filePath) {
      mkpath(this.options.dir, (err) => {
        if (err) throw err;
        fslib.open(this.options.filePath, 'a+', (err, fd) => {
          if (err) throw err;
          fslib.readFile(fd, { encoding: 'utf8' }, (err, content) => {
            if (err) throw err;
            if (content.length === 0) {
              this.logBuffer = [];
            } else {
              try {
                this.logBuffer = this._parse(content);
              } catch (err) {
                console.error("Corrupted log");
                fslib.close(fd);
                throw err;
              }
              if ((typeof (this.logBuffer) !== 'object') && Array.isArray(this.logBuffer)) {
                fslib.close(fd);
                throw new Error("Corrupted log");
              }
            }
            fslib.close(fd, () => null);
            return cbfn(null);
          });
        });
      });
    } else {
      return cbfn(null);
    }
  }

  _saveToDisk(entry) {
    if (!this.options.filePath) return;
    if (!this.options.logStandardOutputToFile) return;
    this.logBuffer.unshift(entry);
    let data = this._stringify(this.logBuffer, null, 2);
    fslib.writeFileSync(this.options.filePath, data);
    // TODO: Proper queuing and async commits
    // fslib.writeFileSync(this.options.filePath, data, (err) => {
    //   if (err) return console.error(err);
    // });
  }

  silent(...args) {
    let entry = {
      unixDatetimeStamp: (new Date()).getTime(),
      type: 'log',
      data: args
    };
    this._saveToDisk(entry);
  }

  log(...args) {
    let entry = {
      unixDatetimeStamp: (new Date()).getTime(),
      type: 'log',
      data: args
    };
    this._saveToDisk(entry);
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
    this._saveToDisk(entry);
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
    this._saveToDisk(entry);
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
    this._saveToDisk(entry);
    if (!this.isMuted) {
      console.error(err);
    }
  }

}

exports.Logger = Logger;