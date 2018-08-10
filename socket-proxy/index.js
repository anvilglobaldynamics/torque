
const fs = require('fs');
const https = require('https');
const http = require('http');
const WebSocket = require('ws');
const pathlib = require("path");
const userHomeDir = require('user-home');
const { ProducerManager } = require('./producer-manager');
const { ConsumerManager } = require('./consumer-manager');

let producerManager = new ProducerManager();
let consumerManager = new ConsumerManager();

const config = (() => {
  try {
    return JSON.parse(fs.readFileSync(pathlib.join(userHomeDir, "/socket-proxy-config.json"), 'utf8'));
  } catch (ex) {
    return JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  }
})();

const webServer = (() => {
  if (config.ssl.enabled) {
    return https.createServer({
      cert: fs.readFileSync(config.ssl.cert, 'utf8'),
      key: fs.readFileSync(config.ssl.key, 'utf8')
    });
  } else {
    return http.createServer();
  }
})();

const wss = new WebSocket.Server({
  server: webServer
});

wss.on('connection', (ws) => {

  let sendMessage = (ws, message) => {
    console.info("(sending)>", message)
    try {
      if (typeof (message) !== "string") message = JSON.stringify(message);
      ws.send(message, (err) => {
        if (err) console.error(err);
      });
    } catch (ex) {
      console.error(ex);
    }
  }

  ws.on('message', (message) => {
    console.info("(received)>", message)

    if (message === config.producerPssk && !ws.isProducer) {
      producerManager.addProducer(ws);
      return;
    }

    if (ws.isProducer) {
      let operation, requestUid, consumerId, body;
      try {
        message = JSON.parse(message);
        ({ operation, consumerId, requestUid, body } = message);
        // TODO: Validate
      } catch (ex) {
        console.error(ex);
        return;
      }
      let consumer = consumerManager.getConsumer(consumerId);
      if (!consumer) {
        console.log("consumer does not exist:", consumer);
        return;
      }
      sendMessage(consumer, {
        operation: 'response',
        requestUid,
        body,
      });
    } else {
      let requestUid, path, body;
      try {
        message = JSON.parse(message);
        ({ requestUid, path, body } = message);
        // TODO: Validate
      } catch (ex) {
        console.error(ex);
        return;
      }
      let producer = producerManager.getNextProducer();
      if (!producer) {
        sendMessage(ws, {
          operation: 'response',
          requestUid,
          body: {
            hasError: true,
            error: {
              code: "NO_SOCKET_PRODUCER",
              message: "Can not serve your reques at this time. No socket producer is present."
            }
          }
        });
        return;
      }
      if (!ws.isConsumer) {
        consumerManager.addConsumer(ws);
      }
      sendMessage(producer, {
        operation: 'request-proxy',
        requestUid,
        path,
        body,
        consumerId: ws.consumerId
      });
    }




    // try {
    //   message = JSON.parse(message);
    // } catch (ex) {
    //   console.error(ex);
    //   return;
    // }
    // if (message.type === 'request-proxy--request') {
    //   let { uid, request } = message;
    //   let { path, data } = request;
    //   proxier.proxyRequest(ws, { path, data, uid });
    // } else {
    //   console.log('received uknown: %s', message);
    // }
    // body: {
    //   hasError: true,
    //   error: {
    //     code: "NO_SOCKET_PRODUCER",
    //     message: "Can not serve your reques at this time. No socket producer is present."
    //   }
    // }
  });

  ws.on('close', (code, reason) => {
    console.log("INFO (socket:close)>", code, reason);
    producerManager.removeProducer(ws);
    consumerManager.removeConsumer(ws);
  });

  ws.on('error', (err) => {
    console.log(`ERR (socket)>>`);
    console.error(err);
    producerManager.removeProducer(ws);
    consumerManager.removeConsumer(ws);
  });

});

wss.on('error', (err) => {
  console.log(`ERR (wss)>`, err);
})

webServer.listen(config.port, (err) => {
  if (err) throw err;
  console.log(`(program)> server running on ${config.port}`);
});




