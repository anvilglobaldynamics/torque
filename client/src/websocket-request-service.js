/* WebsocketRequestService adds WebsocketRequestService to service tree */
(function () {

  const REQUEST_TIMEOUT = 15 * 1000;

  let secondaryNotifyFn = (status) => {
    if (!window.torqueWebsocketIndicatorStatusReceivedFn) return;
    window.torqueWebsocketIndicatorStatusReceivedFn(status);
  }

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
        secondaryNotifyFn('connected');
        isCallbackCalled = true;
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
        secondaryNotifyFn('error');
        isCallbackCalled = true;
        return cbfn(connectionError);
      }

      connection.onopen = _ => {
        openConnectionMap[host] = {
          connection: connection,
          isOpen: true
        };

        secondaryNotifyFn('connected');
        if (!isCallbackCalled) {
          isCallbackCalled = true;
          cbfn(null, connection);
        }
      }

      connection.addEventListener('close', (e) => {
        if (host in openConnectionMap) {
          openConnectionMap[host].isOpen = false;
        }

        secondaryNotifyFn('closed');
        if (!isCallbackCalled) {
          isCallbackCalled = true;
          cbfn(e);
        }
      });

      connection.addEventListener('error', (e) => {
        if (host in openConnectionMap) {
          openConnectionMap[host].isOpen = false;
        }

        secondaryNotifyFn('error');
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
      let isResolved = false;
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
          isResolved = true;
          return;
        }

        let messageHandlerFn = (e, wasTimedOut = false) => {
          if (isResolved) return; // request is already somehow resolved.

          if (wasTimedOut) {
            this.emit('error', new StandardEvent({
              name: 'error',
              detail: {
                isParseError: false,
                parseError: null,
                error: (new Error("Socket request timed out"))
              }
            }));
            this.emit('end', new StandardEvent({
              name: 'end',
              detail: {
                resolution: 'error',
                isParseError: false,
                parseError: null,
                error: (new Error("Socket request timed out"))
              }
            }));
            this._serviceEnd();
            isResolved = true;
            return;
          }

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
            isResolved = true;
            return;
          }
          if (responseMessage.requestUid === requestMessage.requestUid) {
            isResolved = true;
            connection.removeEventListener('message', messageHandlerFn);
            this.emit('end', new StandardEvent({
              name: 'end',
              detail: {
                resolution: 'success',
                statusCode: 200,
                body: responseMessage.body
              }
            }));
            this._serviceEnd();
          }
        };
        connection.addEventListener('message', messageHandlerFn);
        setTimeout(() => {
          messageHandlerFn(null, true);
        }, REQUEST_TIMEOUT);
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