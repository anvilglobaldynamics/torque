
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

const WEBSOCKET_CLIENT_POOL_MAX_COUNT = 24;
const WEBSOCKET_RECONNECTION_DELAY = 10000;
const WEBSOCKET_STARTUP_DELAY = 5000;

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

  __createWebsocketClient() {
    let ws = new WebSocket(this.config.socketProxy.url);
    let listener = (err) => {
      this.__socketClientCount -= 1;
      if (!this.__hasReportedAnySocketFailure) {
        this.__hasReportedAnySocketFailure = true;
        this.logger.error(err);
      }
    }
    let serial = this.__socketClientSerialSeed;
    this.__socketClientSerialSeed += 1;

    ws.once('error', listener);

    this.__socketClientCount += 1;
    ws.on('open', () => {
      // this.logger.debug(`Websocket added to socket-pool: #${serial}`);

      ws.on('close', (code) => {
        this.__socketClientCount -= 1;
        // this.logger.debug('Websocket closed:', `#${serial}`);
      });

      ws.on('error', (err) => {
        this.__socketClientCount -= 1;
        this.logger.error(err);
      });
      ws.removeListener('error', listener);

      let authMessage = this.config.socketProxy.pssk + '/' + (process.env.GAE_VERSION || this.__socketMockGaeVersion);
      ws.send(authMessage);

      ws.on('message', (message) => {
        // this.logger.debug('Websocket message on', `#${serial}`);
        if (message === 'COMMAND:DISCONNECT:OLDVERSION') {
          this.logger.important("(ws:socket)> Received request to stop opening websocket connections.");
          this.__socketIsOldVersion = true;
          return
        }

        try {
          message = JSON.parse(message);
        } catch (err) {
          this.logger.log("(ws:socket)> Expected message to be a valid JSON", message);
          return;
        }

        if ((typeof message !== 'object') || (message === null)) {
          this.logger.log("(ws:socket)> Expected message to be a stringified object.", message);
          return;
        }

        let schema = Joi.object().keys({
          requestUid: Joi.string().length(20).required(),
          operation: Joi.string().min(1).max(128).required(),
          consumerId: Joi.number().required(),
          path: Joi.string().min(1).max(128).required(),
          body: Joi.object().required()
        });
        let { error, value } = Joi.validate(message, schema);
        if (error) {
          this.logger.log("(ws:socket)> Socket request validation error." + JSON.stringify(error), message);
          return;
        }
        message = value;

        let route = this._wsApiList.find(({ path }) => {
          return path === message.path;
        });
        if (!route) {
          ws.send("Unkown route requested");
          return;
        }

        let { ApiClass } = route;
        this.logger.info('WS', `${message.path} ${message.requestUid}`);
        if (ApiClass.prototype instanceof LegacyApi) {
          let api = new ApiClass(message.path, this, this.database, this.legacyDatabase, this.logger, null, null, ws, 'ws', message.requestUid, message.consumerId);
          api._prehandlePostOrWsApi(message.body);
        } else {
          let api = new ApiClass(message.path, this, this.database, this.logger, null, null, ws, 'ws', message.requestUid, message.consumerId);
          api._prehandle(message.body);
        }
      });
    });
  }

  __spawnWebsocketIfNecessary() {
    if (this.config.socketProxy.url.indexOf('wss') > -1) {
      this.logger.info("(server)> attempting websocket connection. Connected", this.__socketClientCount, 'out of', WEBSOCKET_CLIENT_POOL_MAX_COUNT);
    }
    let lim = Math.max(WEBSOCKET_CLIENT_POOL_MAX_COUNT - this.__socketClientCount, 0);
    for (let i = 0; i < lim; i++) {
      this.__createWebsocketClient();
    }
    if (!this.__socketIsOldVersion) {
      setTimeout(() => {
        this.__spawnWebsocketIfNecessary();
      }, WEBSOCKET_RECONNECTION_DELAY);
    }
  }

  _initializeWebsocket() {
    this.__socketIsOldVersion = false;
    this.__socketMockGaeVersion = moment((new Date)).format('YYYYMMDDtHHmmss');
    this.__socketClientSerialSeed = 0;
    this.__socketClientCount = 0;
    this._wsApiList = [];
    if (!this.config.socketProxy.enabled) {
      this.logger.info("(server)> websocket server is not enabled.");
      return;
    }
    this.logger.info("(server)> websocket socket-proxy is", this.config.socketProxy.url);
    setTimeout(() => {
      this.__spawnWebsocketIfNecessary();
    }, WEBSOCKET_STARTUP_DELAY);
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