var http = require('http'),
  httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', function (proxyReq, req, res, options) {
  proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
});

var server = http.createServer(function (req, res) {

  try {
    const b64auth = ((req.headers.authorization || '').split(' ')[1] || '');
    const [login, password] = new Buffer(b64auth, 'base64').toString().split(':');
    if (!(login === 'admin' && password === 'admin')) {
      throw new Error("Invalid Credentials");
    }
    // res.end("ALL OK");
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

console.log("listening on port 19998")
server.listen(19998);