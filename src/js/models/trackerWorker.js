const debug = require('debug')('trackerWorker');
const {types, getParent} = require('mobx-state-tree');
import FrameWorker from '../tools/frameWorker';
import exKitRequest from '../tools/exKitRequest';
import exKitBuildConnectRe from '../tools/exKitBuildConnectRe';


const trackerWorker = types.model('trackerWorker', {
  readyState: types.optional(types.string, 'idle'), // idle, loading, ready, error
}).actions(self => {
  return {
    setReadyState(value) {
      self.readyState = value;
    }
  };
}).views(self => {
  let worker = null;
  const requests = [];
  let connectRe = null;

  const api = {
    request: (details) => {
      return exKitRequest(self, details);
    }
  };

  return {
    search(query) {
      return worker.callFn('events.search', [{
        query: query
      }]);
    },
    searchNext(next) {
      return worker.callFn('events.getNextPage', [next]);
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
        worker = new FrameWorker(tracker.id, api);
        worker.init();
        worker.callFn('init', [tracker.code, tracker.meta.require.slice(0)]).then(() => {
          self.setReadyState('ready');
        }, err => {
          self.setReadyState('error');
          debug('init error', tracker.id, err);
          self.destroyWorker();
        });
      }
    },
    beforeDestroy() {
      self.destroyWorker();
      self.abortAllRequests();
    }
  };
});

export default trackerWorker;