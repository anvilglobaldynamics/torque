
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
const { LegacyApi } = require('./legacy-api-base');

class Server {

  constructor(config, mode) {
    this.mode = mode;
    this.config = config;
    this._hostname = config.server.hostname;
    this._port = config.server.port;
    this._websocketPort = config.server.websocketPort;
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
    this._wsServer = new WebSocket.Server({ server: this._webServer });
    this._wsApiList = [];
    this.logger.info("(server)> websocket server listening on port", this._websocketPort);

    this._wsServer.on('connection', (ws, req) => {
      ws.on('message', (message) => {
        try {
          message = JSON.parse(message);
        } catch (err) {
          ws.send("Expected message to be a valid JSON");
          return;
        }

        if ((typeof message !== 'object') || (message === null)) {
          ws.send("Expected message to be a stringified object.");
          return;
        }

        let schema = Joi.object().keys({
          requestUid: Joi.string().length(20).required(),
          path: Joi.string().min(1).max(128).required(),
          body: Joi.object().required()
        });
        let { error, value } = Joi.validate(message, schema);
        if (error) {
          ws.send("Socket request validation error." + JSON.stringify(error));
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
          let api = new ApiClass(this, this.legacyDatabase, this.logger, null, null, ws, 'ws', message.requestUid);
          api._prehandlePostOrWsApi(message.body);
        } else {
          throw new Error("Async APIs are not yet supported.");
        }
      });
    });
  }

  setLogger(logger) {
    this.logger = logger;
  }

  setDatabase(legacyDatabase) {
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
        let api = new ApiClass(this, this.legacyDatabase, this.logger, req, res, null, 'get');
        api._prehandleGetApi();
      } else {
        throw new Error("Async APIs are not yet supported.");
      }
    });
  }

  registerPostApi(path, ApiClass) {
    this._expressApp.post(path, jsonParser, (req, res) => {
      this.logger.info('POST', req.url);
      if (ApiClass.prototype instanceof LegacyApi) {
        let api = new ApiClass(this, this.legacyDatabase, this.logger, req, res, null, 'post');
        api._prehandlePostOrWsApi(req.body);
      } else {
        throw new Error("Async APIs are not yet supported.");
      }
    });
    this._wsApiList.push({
      path,
      ApiClass
    })
  }

}

exports.Server = Server;