
let fs = require('fs');
let http = require('http');
let https = require('https');
let express = require('express');
let bodyParser = require('body-parser');
let WebSocket = require('ws');
let Joi = require('joi');
let jsonParser = bodyParser.json({
  limit: '100kb'
});
const { Logger } = require('./logger');
const { LegacyApi } = require('./legacy-api-base');
const moment = require('moment');

const PERIODIC_SOCKET_REPORT_DELAY = 60 * 1000;
const PERIODIC_IDLE_SOCKET_PURGE_INTERVAL = 30 * 60 * 1000;
const SOCKET_IDLE_TIME_THRESHOLD = 5 * 60 * 1000;

class Server {

  constructor(config, mode) {
    this.mode = mode;
    this.config = config;
    this._hostname = config.server.hostname;
    this._port = config.server.port || process.env.PORT || 8080;
    this._expressApp = express();
  }

  async initialize() {
    this._expressApp.settings['x-powered-by'] = false;
    this._expressApp.set('etag', false);
    this._expressApp.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
    await this._initializeWebServer();
    this._initializeWebsocket();
  }

  _getSslDetails() {
    let { key, cert, caBundle } = this.config.server.ssl;
    key = fs.readFileSync(key, 'utf8');
    cert = fs.readFileSync(cert, 'utf8');
    caBundle = fs.readFileSync(caBundle, 'utf8');
    let ca = [];
    let buffer = [];
    for (let line of caBundle.split('\n')) {
      buffer.push(line);
      if (line.indexOf('-END CERTIFICATE-') > -1) {
        ca.push(buffer.join('\n'));
        buffer = [];
      }
    }
    return { key, cert, ca };
  }

  _initializeWebServer() {
    return new Promise((accept, reject) => {
      if (this.config.server.ssl.enabled) {
        let sslDetals = this._getSslDetails();
        this._webServer = https.createServer(sslDetals, this._expressApp);
        this._webServer.listen(this._port, () => {
          this.logger.info("(server)> https server listening on port", this._port);
          return accept();
        });
      } else {
        this._webServer = http.createServer(this._expressApp);
        this._webServer.listen(this._port, () => {
          this.logger.info("(server)> http server listening on port", this._port);
          return accept();
        });
      }
    });
  }

  _initializeWebsocket() {
    this._wsApiList = [];

    const wss = new WebSocket.Server({
      server: this._webServer
    });

    const getTotalMessage = () => {
      return `Total Connections: ${wss.clients.size}`;
    }

    const periodicSocketReport = () => {
      console.log("(wss)> Periodic Socket Status.", getTotalMessage());
      setTimeout(periodicSocketReport, PERIODIC_SOCKET_REPORT_DELAY);
    }
    periodicSocketReport();

    const periodicSocketPurge = () => {
      console.log("(wss)> Periodic Socket Purge.", getTotalMessage());

      let now = Date.now();

      wss.clients.forEach(ws => {
        try {
          if (now - ws.lastActivityDatetimeStamp > SOCKET_IDLE_TIME_THRESHOLD) {
            ws.terminate();
          }
        } catch (ex) {
          console.error(ex);
        }
      });

      setTimeout(periodicSocketPurge, PERIODIC_IDLE_SOCKET_PURGE_INTERVAL);
    }
    periodicSocketPurge();

    wss.on('connection', (ws) => {
      console.log("(wss)> New Socket Client Connected.", getTotalMessage());

      ws.on('close', () => {
        console.log("(wss)> Socket Closed.", getTotalMessage());
      });

      ws.on('error', (err) => {
        console.error("(ws)> Error", err);
        console.log("(wss)> Socket Error.", getTotalMessage());
      });

      ws.on('message', (message) => {
        // console.log("(ws)> message received:", message);
        ws.lastActivityDatetimeStamp = Date.now();

        // Validate JSON
        try {
          message = JSON.parse(message);
        } catch (err) {
          this.logger.log("(ws)> Expected message to be a valid JSON", message);
          return;
        }

        // Make sure it is an object
        if ((typeof message !== 'object') || (message === null)) {
          this.logger.log("(ws)> Expected message to be a stringified object.", message);
          return;
        }

        // Validate Schema
        let schema = Joi.object().keys({
          requestUid: Joi.string().length(20).required(),
          path: Joi.string().min(1).max(128).required(),
          body: Joi.object().required()
        });
        let { error, value } = Joi.validate(message, schema);
        if (error) {
          this.logger.log("(ws)> Socket request validation error." + JSON.stringify(error), message);
          return;
        }
        message = value;

        // match route
        let route = this._wsApiList.find(({ path }) => {
          return path === message.path;
        });
        if (!route) {
          this.logger.log("(ws)> Unkown route requested", message.path);
          ws.send("Unkown route requested");
          return;
        }

        // process api
        let { ApiClass } = route;
        this.logger.info('WS', `${message.path} ${message.requestUid}`);
        if (ApiClass.prototype instanceof LegacyApi) {
          let api = new ApiClass(message.path, this, this.database, this.legacyDatabase, this.logger, null, null, ws, 'ws', message.requestUid, null);
          api._prehandlePostOrWsApi(message.body);
        } else {
          let api = new ApiClass(message.path, this, this.database, this.logger, null, null, ws, 'ws', message.requestUid, null);
          api._prehandle(message.body);
        }

      });
    });

    wss.on('error', (err) => {
      console.log("(wss)> Error:", err);
    });

    console.log(`(wss)> Listening on port ${this._port}`);
  }

  setLogger(logger) {
    /** @type Logger */
    this.logger = logger;
  }

  setDatabase(database) {
    this.database = database;
  }

  setLegacyDatabase(legacyDatabase) {
    this.legacyDatabase = legacyDatabase;
  }

  setEmailService(emailService) {
    this.emailService = emailService;
  }

  setSmsService(smsService) {
    this.smsService = smsService;
  }

  setTemplateManager(templateManager) {
    this.templateManager = templateManager;
  }

  registerGetApi(path, ApiClass) {
    this._expressApp.get(path, jsonParser, (req, res) => {
      this.logger.info('GET', req.url);
      if (ApiClass.prototype instanceof LegacyApi) {
        let api = new ApiClass(path, this, this.database, this.legacyDatabase, this.logger, req, res, null, 'get');
        api._prehandleGetApi();
      } else {
        throw new Error("Async APIs are not yet supported.");
      }
    });
  }

  registerPostApi(path, ApiClass) {
    if (!ApiClass) throw new Error("Expected ApiClass to be not null/undefined");
    this._expressApp.post(path, jsonParser, (req, res) => {
      setTimeout(() => {
        this.logger.info('POST', req.url);
        if (ApiClass.prototype instanceof LegacyApi) {
          let api = new ApiClass(path, this, this.database, this.legacyDatabase, this.logger, req, res, null, 'post');
          api._prehandlePostOrWsApi(req.body);
        } else {
          let api = new ApiClass(path, this, this.database, this.logger, req, res, null, 'post');
          api._prehandle(req.body);
        }
      }, 1)
    });
    this._wsApiList.push({
      path,
      ApiClass
    })
  }

}

exports.Server = Server;