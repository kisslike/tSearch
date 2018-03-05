const debug = require('debug')('frameWorker');
import once from 'lodash.once';

const emptyFn = () => {};

class Transport {
  constructor(transport) {
    this.transportId = Math.trunc(Math.random() * 1000);
    this.callbackIndex = 0;
    this.listeners = [];
    this.transport = transport;

    this.cbMap = new Map();

    this.onMessage = this.onMessage.bind(this);

    this.transport.onMessage(this.onMessage);
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    const pos = this.listeners.indexOf(listener);
    if (pos !== -1) {
      this.listeners.splice(pos, 1);
    }
  }

  onMessage(msg) {
    const cbMap = this.cbMap;
    if (msg.responseId) {
      const callback = cbMap.get(msg.responseId);
      if (callback) {
        callback(msg.message);
      } else {
        debug('Callback is not found', msg);
      }
    } else {
      let response;
      if (msg.callbackId) {
        response = once(message => {
          this.transport.postMessage({
            responseId: msg.callbackId,
            message: message
          });
        });
      } else {
        response = emptyFn;
      }

      let result = null;
      this.listeners.forEach(cb => {
        try {
          const r = cb(msg.message, response);
          if (r === true) {
            result = true;
          }
        } catch (err) {
          debug('Call listener error', err);
        }
      });
      if (result !== true) {
        response();
      }
    }
  }

  /**
   * @param {*} message
   * @param {function} [callback]
   */
  sendMessage(message, callback) {
    const cbMap = this.cbMap;
    const msg = {
      message: message
    };

    if (callback) {
      msg.callbackId = this.transportId + '_' + (++this.callbackIndex);
      cbMap.set(msg.callbackId, message => {
        cbMap.delete(msg.callbackId);
        callback(message);
      });
    }

    try {
      this.transport.postMessage(msg);
    } catch (err) {
      cbMap.delete(msg.callbackId);
      throw err;
    }
  }

  destroy() {
    this.cbMap.clear();
  }
}

export default Transport;