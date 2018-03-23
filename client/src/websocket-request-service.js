/* WebsocketRequestService adds WebsocketRequestService to service tree */
(function () {

  var openConnectionMap = {};

  let {
    StandardEvent,
    EventEmitter,
    ServiceManager,
    Service
  } = window.ServiceTree;

  let requestUidSeed = 0;

  class WebsocketRequestService extends Service {

    constructor(host, url, options = {}) {
      super();
      let {
        responseType = 'text'
      } = options;
      Object.assign(this, { host, url, responseType });
      this._hasErrorBeenNotified = false;
    }

    _serialize(content) {
      return JSON.stringify(content);
    }

    _deserialize(content) {
      return JSON.parse(content);
    }

    _reuseOrEstablishConnection(cbfn) {
      var host = this.host;
      var isCallbackCalled = false;

      if (host in openConnectionMap && openConnectionMap[host].isOpen) {
        cbfn(null, openConnectionMap[host].connection);
        return;
      }

      var connection = null;
      let connectionError = null;
      try {
        connection = new WebSocket(this.host, ['soap', 'xmpp']);
      } catch (error) {
        connectionError = error;
      }
      if (connectionError) {
        return cbfn(connectionError);
      }

      connection.onopen = _ => {
        openConnectionMap[host] = {
          connection: connection,
          isOpen: true
        };

        if (!isCallbackCalled) {
          isCallbackCalled = true;
          cbfn(null, connection);
        }
      }

      connection.addEventListener('close', (e) => {
        // console.log('socket closed');
        if (host in openConnectionMap) {
          openConnectionMap[host].isOpen = false;
        }

        if (!isCallbackCalled) {
          isCallbackCalled = true;
          cbfn(e);
        }
      });

      connection.addEventListener('error', (e) => {
        // console.log('socket error');
        if (host in openConnectionMap) {
          openConnectionMap[host].isOpen = false;
        }

        if (!isCallbackCalled) {
          isCallbackCalled = true;
          cbfn(e);
        }
      })

    }

    request(...args) {
      let [body = null, type = null] = args.reverse()

      if (type === null) {
        if (typeof (body) === 'object' && body !== null) {
          type = 'json';
        } else {
          type = 'text';
        }
      }

      // NOTE: the type option is willingly ignored.

      if (requestUidSeed % 800 === 0) {
        requestUidSeed = 0;
      }
      requestUidSeed += 1;
      let now = '' + (new Date()).getTime();
      let requestUid = String(requestUidSeed) + '-' + now;
      requestUid = ('00000000000000000000'.substr(requestUid.length) + requestUid);
      let requestMessage = {
        path: this.url,
        requestUid,
        body: body
      }
      this._reuseOrEstablishConnection((err, connection) => {
        if (err) {
          this.emit('error', new StandardEvent({
            name: 'error',
            detail: {
              isParseError: false,
              parseError: null,
              error: err
            }
          }));
          this.emit('end', new StandardEvent({
            name: 'end',
            detail: {
              resolution: 'error',
              isParseError: false,
              parseError: null
            }
          }));
          return;
        }

        let messageHandlerFn = (e) => {
          let responseMessage;
          try {
            responseMessage = this._deserialize(e.data);
          } catch (err) {
            this.emit('error', new StandardEvent({
              name: 'error',
              detail: {
                isParseError: true,
                parseError: err
              }
            }));
            this.emit('end', new StandardEvent({
              name: 'end',
              detail: {
                resolution: 'error',
                isParseError: true,
                parseError: err
              }
            }));
            this._serviceEnd();
            return;
          }
          if (responseMessage.requestUid === requestMessage.requestUid) {
            connection.removeEventListener('message', messageHandlerFn);
            this.emit('end', new StandardEvent({
              name: 'end',
              detail: {
                resolution: 'success',
                statusCode: 200,
                body: responseMessage.message
              }
            }));
            this._serviceEnd();
          }
        };
        connection.addEventListener('message', messageHandlerFn);
        connection.send(this._serialize(requestMessage));
        this.emit('start', new StandardEvent({
          name: 'start',
          detail: {
            url: this.url,
            payload: body
          }
        }));
        this._serviceStart();
      });

    }

  }

  window.ServiceTree.WebsocketRequestService = WebsocketRequestService;

})();