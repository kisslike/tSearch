import FrameWorker from '../tools/frameWorker';
import exKitRequest from '../tools/exKitRequest';
import exKitBuildConnectRe from '../tools/exKitBuildConnectRe';
const debug = require('debug')('trackerWorker');
const {types, getParent, isAlive} = require('mobx-state-tree');

/**
 * @typedef {{}} TrackerWorkerM
 * Model:
 * @property {string} readyState
 * Actions:
 * @property {function(string)} setReadyState
 * Views:
 * @property {function(string):Promise} search
 * @property {function(Object):Promise} searchNext
 * @property {string[]} requests
 * @property {RegExp} connectRe
 * @property {function} abortAllRequests
 * @property {function} destroyWorker
 * @property {function} afterCreate
 * @property {function} beforeDestroy
 */


const trackerWorkerModel = types.model('trackerWorkerModel', {
  readyState: types.optional(types.string, 'idle'), // idle, loading, ready, error
}).actions(/**TrackerWorkerM*/self => {
  return {
    setReadyState(value) {
      self.readyState = value;
    }
  };
}).views(/**TrackerWorkerM*/self => {
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
    search(query) {
      return initPromise.then(() => {
        if (!worker) {
          throw new Error('Worker is dead');
        }
        return worker.callFn('events.search', [{
          query: query
        }]);
      });
    },
    searchNext(next) {
      return initPromise.then(() => {
        if (!worker) {
          throw new Error('Worker is dead');
        }
        return worker.callFn('events.getNextPage', [next]);
      });
    },
    get requests() {
      return requests;
    },
    get connectRe() {
      if (!connectRe) {
        const tracker = getParent(self, 1);
        connectRe = exKitBuildConnectRe(tracker.meta.connect.slice(0));
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
    afterCreate() {
      if (!worker) {
        self.setReadyState('loading');
        const tracker = getParent(self, 1);
        const trackerId = tracker.id;
        worker = new FrameWorker({
          trackerId: tracker.id
        }, api);
        initPromise = worker.callFn('init', [tracker.code, tracker.meta.require.slice(0)]).catch(() => {
          return void 0;
        }, err => {
          debug('init error', trackerId, err);
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

export default trackerWorkerModel;