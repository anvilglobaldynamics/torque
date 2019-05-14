
const { ConfigLoader } = require('../server/src/config-loader');
const https = require('https');
const fs = require('fs');
const httpProxy = require('http-proxy');
const cryptolib = require('crypto');

const _getSslDetails = (config) => {
  let { key, cert, caBundle } = config.server.ssl;
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

const _getConfig = () => {
  return ConfigLoader.getComputedConfig();
}

const _makeHash = (string) => {
  return cryptolib.createHash('sha256').update(string).digest("hex");
}


const main = () => {

  let config = _getConfig();

  let proxy = httpProxy.createProxyServer({});

  proxy.on('proxyReq', function (proxyReq, req, res, options) {
    proxyReq.setHeader('X-Proxied-By', 'torque');
  });

  let sslDetails = _getSslDetails(config);

  let server = https.createServer(sslDetails, (req, res) => {

    try {
      const b64auth = ((req.headers.authorization || '').split(' ')[1] || '');
      const [_username, _password] = new Buffer(b64auth, 'base64').toString().split(':');
      const _passwordHash = _makeHash(password);

      let admin = config.admin.list.find(({ username, passwordHash }) => {
        return (username === _username && passwordHash === _passwordHash);
      });

      if (!admin) {
        throw new Error("Invalid Credentials");
      }
    } catch (ex) {
      res.setHeader('WWW-Authenticate', 'Basic realm="401"') // change this
      res.statusCode = 401;
      res.end('Authentication required.') // custom message
      return;
    }

    proxy.web(req, res, {
      target: 'http://127.0.0.1:19999'
    });

  });

  console.log("(netdata-proxy)> listening on port 19998");
  server.listen(19998);

}

main();


