
let express = require('express');
let bodyParser = require('body-parser');
let jsonParser = bodyParser.json({
  limit: '100kb'
});

class Server {

  constructor(config, mode) {
    this.mode = mode;
    this.config = config;
    this._hostname = config.hostname;
    this._port = config.port;
    this._expressApp = express();
  }

  initialize(cbfn) {
    // this._expressApp.get('*', (req, res) => {
    //   this.logger.log("GET", req.url);
    //   res.send(`You have reached the API server for ${this.config.baseName}`);
    // });
    this._expressApp.settings['x-powered-by'] = false;
    this._expressApp.set('etag', false);
    this._expressApp.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
    this._expressApp.listen(this._port, () => {
      this.logger.info("(server)> server listening on port", this._port);
      return cbfn();
    });
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

  setTemplateManager(templateManager) {
    this.templateManager = templateManager;
  }

  registerGetApi(path, ApiClass) {
    return this._expressApp.get(path, jsonParser, (req, res) => {
      this.logger.info('GET', req.url);
      let api = new ApiClass(this, this.database, this.logger, req, res);
      api.prehandleGetApi();
    });
  }

  registerPostApi(path, ApiClass) {
    return this._expressApp.post(path, jsonParser, (req, res) => {
      this.logger.info('POST', req.url);
      let api = new ApiClass(this, this.database, this.logger, req, res);
      api.prehandlePostApi();
    });
  }

}

exports.Server = Server