/* WebsocketRequestService adds WebsocketRequestService to service tree */
(function () {

  var openConnectionMap = {};

  let {
    StandardEvent,
    EventEmitter,
    ServiceManager,
    Service
  } = window.ServiceTree;

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

    _initializeWebsockets() {
      var connection = new WebSocket('ws://localhost:8541', ['soap', 'xmpp']);
      // When the connection is open, send some data to the server
      connection.onopen = function () {
        console.log('open')

        data = JSON.stringify(data);
        connection.send(data);
      };

      // Log errors
      connection.onerror = function (error) {
        console.log('WebSocket Error ' + error);
      };

      // Log messages from the server
      connection.onmessage = function (e) {
        console.log('Server: ' + e.data);
      };
    }

    _reuseOrEstablishConnection(cbfn) {
      var host = this.host;
      var isCallbackCalled = false;

      if (host in openConnectionMap && openConnectionMap[host].isOpen) {
        cbfn(null, openConnectionMap[host].connection);
        return;
      }

      var connection = new WebSocket(this.host, ['soap', 'xmpp']);

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

      // NOTE: the type option is gracefully ignored.

      let now = '' + (new Date()).getTime();
      let requestMessage = {
        path: this.url,
        requestUid: ('0000000000000000'.substr(now.length) + now),
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

      // 

      // this._xmlHttpRequest = new XMLHttpRequest();

      // this._xmlHttpRequest.onload = (_ => this._onLoad());
      // this._xmlHttpRequest.onabort = (_ => this._onAbort());
      // this._xmlHttpRequest.upload.onabort = (_ => this._onAbort());
      // this._xmlHttpRequest.onerror = (_ => this._onError());
      // this._xmlHttpRequest.upload.onerror = (_ => this._onError());
      // this._xmlHttpRequest.onprogress = (event => this._onDownloadProgress(event));
      // this._xmlHttpRequest.upload.onprogress = (event => this._onUploadProgress(event));

      // this._xmlHttpRequest.open(this.method, this.url, true);

      // if (body === null) {
      //   this.payload = null;
      // } else {
      //   this.payload = this._serialize(body);
      //   if (type === 'json') {
      //     this._xmlHttpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      //   } else {
      //     this._xmlHttpRequest.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
      //   }
      // }

      // for (let key in this.headers) {
      //   this._xmlHttpRequest.setRequestHeader(key, this.headers[key]);
      // }

      // if (body === null) {
      //   this._xmlHttpRequest.send();
      // } else {
      //   this._xmlHttpRequest.send(this.payload);
      // }

      // this.emit('start', new StandardEvent({
      //   name: 'start',
      //   detail: {
      //     url: this.url,
      //     payload: this.payload
      //   }
      // }));
      // this.emit('progress', new StandardEvent({
      //   name: 'progress',
      //   detail: {
      //     progress: 0
      //   }
      // }));


    }

    // _onLoad() {
    //   let {
    //     status: statusCode,
    //     responseText: body
    //   } = this._xmlHttpRequest;

    //   let error = null;
    //   if (this.responseType === 'json') {
    //     try {
    //       body = this._deserialize(body);
    //     } catch (ex) {
    //       error = ex;
    //     }
    //   }
    //   if (error) {
    //     return this._onError(true, error);
    //   }

    //   this.emit('progress', new StandardEvent({
    //     name: 'progress',
    //     detail: {
    //       progress: 1
    //     }
    //   }));
    //   this.emit('load', new StandardEvent({
    //     name: 'load',
    //     detail: {
    //       statusCode, body
    //     }
    //   }));
    //   this.emit('end', new StandardEvent({
    //     name: 'end',
    //     detail: {
    //       resolution: 'success',
    //       statusCode,
    //       body
    //     }
    //   }));
    //   this._serviceEnd();
    // }

    // _onAbort() {
    //   this.emit('progress', new StandardEvent({
    //     name: 'progress',
    //     detail: {
    //       progress: 0
    //     }
    //   }));
    //   this.emit('abort', new StandardEvent({
    //     name: 'abort',
    //     detail: {
    //     }
    //   }));
    //   this.emit('end', new StandardEvent({
    //     name: 'end',
    //     detail: {
    //       resolution: 'abort'
    //     }
    //   }));
    //   this._serviceEnd();
    // }

    // _onError(isParseError = false, parseError = null) {
    //   if (this._hasErrorBeenNotified) return;
    //   this._hasErrorBeenNotified = true;
    //   this.emit('progress', new StandardEvent({
    //     name: 'progress',
    //     detail: {
    //       progress: 0
    //     }
    //   }));
    //   this.emit('error', new StandardEvent({
    //     name: 'error',
    //     detail: {
    //       isParseError,
    //       parseError
    //     }
    //   }));
    //   this.emit('end', new StandardEvent({
    //     name: 'end',
    //     detail: {
    //       resolution: 'error',
    //       isParseError,
    //       parseError
    //     }
    //   }));
    //   this._serviceEnd();
    // }

    // _onUploadProgress(event) {
    //   if (event.lengthComputable) {
    //     let progress = event.loaded / event.total;
    //     this.emit('upload-progress', new StandardEvent({
    //       name: 'upload-progress',
    //       detail: {
    //         loaded: event.loaded,
    //         total: event.total,
    //         progress
    //       }
    //     }));
    //     this.emit('progress', new StandardEvent({
    //       name: 'progress',
    //       detail: {
    //         progress: (Math.round((progress / 2) * 100) / 100)
    //       }
    //     }));
    //   }
    // }

    // _onDownloadProgress(event) {
    //   if (event.lengthComputable) {
    //     let progress = event.loaded / event.total;
    //     this.emit('download-progress', new StandardEvent({
    //       name: 'download-progress',
    //       detail: {
    //         loaded: event.loaded,
    //         total: event.total,
    //         progress
    //       }
    //     }));
    //     this.emit('progress', new StandardEvent({
    //       name: 'progress',
    //       detail: {
    //         progress: 0.5 + (Math.round((progress / 2) * 100) / 100)
    //       }
    //     }));
    //   }
    // }
  }

  window.ServiceTree.WebsocketRequestService = WebsocketRequestService;

})();