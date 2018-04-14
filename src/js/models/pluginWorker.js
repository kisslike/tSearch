import FrameWorker from '../tools/frameWorker';
import exKitRequest from '../tools/exKitRequest';
import exKitBuildConnectRe from '../tools/exKitBuildConnectRe';
import {types, getParent, isAlive} from "mobx-state-tree";

const debug = require('debug')('worker');

/**
 * @typedef {{}} PluginWorkerM
 * Model:
 * @property {string} readyState
 * Actions:
 * @property {function(string)} setReadyState
 * Views:
 * @property {function(string, [Array]):Promise} callFn
 * @property {string[]} requests
 * @property {RegExp} connectRe
 * @property {function} abortAllRequests
 * @property {function} destroyWorker
 * @property {function} afterCreate
 * @property {function} beforeDestroy
 */


const PluginWorkerModel = types.model('PluginWorkerModel', {
  readyState: types.optional(types.string, 'idle'), // idle, loading, ready, error
}).actions(/**PluginWorkerM*/self => {
  return {
    setReadyState(value) {
      self.readyState = value;
    }
  };
}).views(/**PluginWorkerM*/self => {
  let worker = null;
  const requests = [];
  let connectRe = null;
  let initPromise = null;

  const api = {
    request: (details) => {
      return exKitRequest(self, details);
    }
  };

  return {
    callFn(event, args) {
      return initPromise.then(() => {
        if (!worker) {
          throw new Error('Worker is dead');
        }
        return worker.callFn(event, args);
      });
    },
    get api() {
      return api;
    },
    get requests() {
      return requests;
    },
    get connectRe() {
      if (!connectRe) {
        const plugin = self.getPlugin();
        connectRe = exKitBuildConnectRe(plugin.meta.connect.slice(0));
      }
      return connectRe;
    },
    abortAllRequests() {
      requests.splice(0).forEach(req => {
        req.abort();
      });
    },
    destroyWorker() {
      if (worker) {
        worker.destroy();
        worker = null;
      }
    },
    getPlugin() {
      return getParent(self, 1);
    },
    afterCreate() {
      if (!worker) {
        self.setReadyState('loading');
        const plugin = self.getPlugin();
        const pluginId = plugin.id;
        worker = new FrameWorker({
          pluginId: plugin.id
        }, self.api);
        const info = {
          locale: plugin.meta.locale
        };
        initPromise = worker.callFn('init', [plugin.code, plugin.meta.require.slice(0), info]).catch(() => {
          return void 0;
        }, err => {
          debug('init error', pluginId, err);
          throw new Error('InitWorkerError');
        });
        initPromise.then(() => {
          if (isAlive(self)) {
            self.setReadyState('ready');
          } else {
            debug('init>then skip, dead');
          }
        }, err => {
          if (isAlive(self)) {
            self.setReadyState('error');
            self.destroyWorker();
          } else {
            debug('init>catch skip, dead');
          }
        });
      }
    },
    beforeDestroy() {
      self.destroyWorker();
      self.abortAllRequests();
    }
  };
});

export default PluginWorkerModel;