const debug = require('debug')('sandbox');
import Transport from '../tools/transport';

import baseApi from './baseApi';

import requirejs from 'script-loader!requirejs/require';

window.define('jquery', () => window.$ = window.jQuery = require('jquery'));
window.define('moment', () => window.moment = require('moment'));
window.define('exKit', () => require('./exKit'));

const runCode = code => {
  return eval(code);
};

const api = {
  init: function (code, requireList) {
    return new Promise(r => window.require(requireList, r)).then(() => {
      return runCode(code);
    }).catch(err => {
      debug('Init error', err);
      throw err;
    });
  },
  events: {}
};

const transport = new Transport({
  postMessage: function (msg) {
    parent.postMessage(msg, '*');
  },
  onMessage: function (cb) {
    window.onmessage = function (e) {
      if (e.source === parent) {
        cb(e.data);
      }
    };
  }
}, api);

window.API_event = function (name, callback) {
  api.events[name] = function (query) {
    return Promise.resolve().then(function () {
      return callback(query);
    });
  };
};

window.API_request = function (options) {
  return transport.callFn('request', [options]);
};