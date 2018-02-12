
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

class Server {

  constructor(config, mode) {
    this.mode = mode;
    this.config = config;
    this._hostname = config.server.hostname;
    this._port = config.server.port;
    this._websocketPort = config.server.websocketPort;
    this._expressApp = express();
  }

  initialize(cbfn) {
    this._expressApp.settings['x-powered-by'] = false;
    this._expressApp.set('etag', false);
    this._expressApp.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
    this._initializeWebServer(() => {
      this._initializeWebsocket(() => {
        return cbfn();
      });
    });
  }

  _initializeWebServer(cbfn) {
    if (this.config.server.ssl.enabled) {
      this._getSslDetails(sslDetals => {
        this._webServer = https.createServer(sslDetals, this._expressApp);
        this._webServer.listen(this._port, () => {
          this.logger.info("(server)> https server listening on port", this._port);
          return cbfn();
        });
      })
    } else {
      this._webServer = http.createServer(this._expressApp);
      this._webServer.listen(this._port, () => {
        this.logger.info("(server)> http server listening on port", this._port);
        return cbfn();
      });
    }
  }

  _getSslDetails(cbfn) {
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
    return cbfn({ key, cert, ca });
  }

  _initializeWebsocket(cbfn) {
    this._wsServer = new WebSocket.Server({ port: this._websocketPort });
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
          requestUid: Joi.string().length(16).required(),
          path: Joi.string().min(1).max(32).required(),
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
        let api = new ApiClass(this, this.database, this.logger, null, null, ws, 'ws', message.requestUid);
        api._prehandlePostOrWsApi(message.body);

      });
    });

    return cbfn();
  }

  setLogger(logger) {
    this.logger = logger;
  }

  setDatabase(database) {
    this.database = database;
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
      let api = new ApiClass(this, this.database, this.logger, req, res, null, 'get');
      api._prehandleGetApi();
    });
  }

  registerPostApi(path, ApiClass) {
    this._expressApp.post(path, jsonParser, (req, res) => {
      this.logger.info('POST', req.url);
      let api = new ApiClass(this, this.database, this.logger, req, res, null, 'post');
      api._prehandlePostOrWsApi(req.body);
    });
    this._wsApiList.push({
      path,
      ApiClass
    })
  }

}

exports.Server = Server