/**
 * @flow
 */

'use strict';

type ResponseFilter = (responseText: string) => string;
type URI = string;

type RequestMethod = 'POST' | 'GET';
type Abortable = {
  abort: () => void
};

const NetEaseMusicAPIConfig = require('./NetEaseMusicAPIConfig');

const invariant = require('invariant');
const httpRequest = require('superagent');
const forEachObject = require('./forEachObject');

class NetEaseMusicAPIRequest {
  _sent: boolean;
  _method: RequestMethod;
  _uri: URI;
  _data: ?Object;
  _headers: {[name: string]: string};
  _responseHandler: ?(responseText: string, responseHeaders: ?string) => void;
  _errorHandler: ?(error: any) => void;
  _timeoutHandler: ?() => void;

  constructor(uri: ?URI) {
    this._sent = false;
    this._headers = NetEaseMusicAPIConfig.headers;
    this._method = 'POST';
    if (uri) {
      this.setURI(uri);
    }
  }

  setURI(uri: URI): NetEaseMusicAPIRequest {
    invariant(
      !this._sent,
      'NetEaseMusicAPIRequest.setURI(...): request is already sent'
    );
    this._uri = uri;
    return this;
  }

  setMethod(method: RequestMethod): NetEaseMusicAPIRequest {
    invariant(
      !this._sent,
      'NetEaseMusicAPIRequest.setMethod(...): request is already sent'
    );
    this._method = method;
    return this;
  }

  setData(data: ?Object): NetEaseMusicAPIRequest {
    invariant(
      !this._sent,
      'NetEaseMusicAPIRequest.setData(...): request is already sent'
    );
    this._data = data;
    return this;
  }

  setRequestHeaders(headers: {[name: string]: string}): NetEaseMusicAPIRequest {
    invariant(
      !this._sent,
      'NetEaseMusicAPIRequest.setRequestHeaders(...): request is already sent'
    );
    this._headers = headers;
    return this;
  }

  setErrorHandler(
    errorHandler: ?(error: any) => void
  ): NetEaseMusicAPIRequest {
    invariant(
      !this._sent,
      'NetEaseMusicAPIRequest.setErrorHandler(...): Already sent request.'
    );
    this._errorHandler = errorHandler;
    return this;
  }

  setResponseHandler(
    responseHandler: (responseText: string, responseHeaders: ?string) => void
  ): NetEaseMusicAPIRequest {
    invariant(
      !this._sent,
      'NetEaseMusicAPIRequest.setResponseHandler(...): Already sent request.'
    );
    this._responseHandler = responseHandler;
    return this;
  }

  setTimeoutHandler(timeoutHandler: ?() => void): NetEaseMusicAPIRequest {
    invariant(
      !this._sent,
      'NetEaseMusicAPIRequest.setTimeoutHandler(...): Already sent request.'
    );
    this._timeoutHandler = timeoutHandler;
    return this;
  }

  /**
   * Send http request to the server
   * Note that `XMLHttpRequest` does not work here because it forbids some header
   * setting.
   */
  send(): Abortable {
    invariant(!this._sent, 'NetEaseMusicAPIRequest.send(): Can only send once.');
    this._sent = true;

    let request = this._method === 'POST' ?
      httpRequest.post(this._uri).send(this._data):
      httpRequest.get(this._uri).query(this._data);

    request
      .set(this._headers)
      .timeout(NetEaseMusicAPIConfig.defaultTimeout)
      .end((err, res) => {
        if (err || !res.ok) {
          if (err.timeout) {
            this._timeoutHandler && this._timeoutHandler();
          } else {
            this._errorHandler && this._errorHandler(err);
          }
          return;
        }
        if (res.ok) {
          this._responseHandler && this._responseHandler(res.body, res.header);
        }
      });

    return {
      abort(): void {
        if (request) {
          request.abort();
        }
      }
    }
  }
}

module.exports = NetEaseMusicAPIRequest;
