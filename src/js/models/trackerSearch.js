const debug = require('debug')('trackerSearch');
const {types, destroy, getParent, isAlive} = require('mobx-state-tree');

/**
 * @typedef {{}} TrackerSearchM
 * Model:
 * @property {string} readyState
 * @property {{url:string}} authRequired
 * @property {string} url
 * @property {{results:TrackerSearchM}[]} pages
 * @property {Object} [nextQuery]
 * Actions:
 * @property {function(string)} setReadyState
 * @property {function(Object)} setResult
 * Views:
 * @property {ProfileTrackerM} profile
 * @property {TrackerM} tracker
 * @property {function(number):TrackerResultM[]} getResultsPage
 * @property {function(string, Promise):Promise} wrapSearchPromise
 * @property {function} searchNext
 * @property {function:number} getResultCount
 */

/**
 * @typedef {{}} TrackerResultM
 * Model:
 * @property {string} title
 * @property {string} url
 * @property {number} [categoryId]
 * @property {string} [categoryTitle]
 * @property {string} [categoryUrl]
 * @property {number} [size]
 * @property {string} [downloadUrl]
 * @property {number} [seed]
 * @property {number} [peer]
 * @property {number} [date]
 * Actions:
 * Views:
 */


const trackerResultModel = types.model('trackerResultModel', {
  title: types.string,
  url: types.string,
  categoryId: types.maybe(types.number),
  categoryTitle: types.optional(types.string, ''),
  categoryUrl: types.optional(types.string, ''),
  size: types.optional(types.number, 0),
  downloadUrl: types.optional(types.string, ''),
  seed: types.optional(types.number, 1),
  peer: types.optional(types.number, 0),
  date: types.optional(types.number, -1),
}).preProcessSnapshot(snapshot => {
  ['size', 'seed', 'peer', 'date'].forEach(key => {
    let value = snapshot[key];
    if (value) {
      let change = false;
      if (typeof value !== 'number') {
        change = true;
        value = parseInt(value, 10);
      }
      if (!isFinite(value)) {
        change = true;
        value = null;
      }
      if (change) {
        snapshot[key] = value;
      }
    }
  });
  return snapshot;
});

const trackerSearchModel = types.model('trackerSearchModel', {
  readyState: types.optional(types.string, 'idle'), // idle, loading, success, error
  authRequired: types.maybe(types.model({
    url: types.string
  })),
  pages: types.optional(types.array(types.model('page', {
    results: types.optional(types.array(trackerResultModel), []),
  })), []),
  nextQuery: types.frozen,
}).actions(/**TrackerSearchM*/self => {
  return {
    setReadyState(state) {
      self.readyState = state;
    },
    setResult(result) {
      if (result.success) {
        if (self.authRequired) {
          destroy(self.authRequired);
        }

        const results = result.results.filter(result => {
          if (!result.title || !result.url) {
            debug('[' + self.tracker.id + ']', 'Skip torrent:', result);
            return false;
          } else {
            return true;
          }
        });
        self.pages.push({
          results: results
        });

        if (result.nextPageRequest) {
          self.nextQuery = result.nextPageRequest;
        }
      } else
      if (result.error === 'AUTH') {
        self.authRequired = {
          url: result.url
        };
      }
    }
  };
}).views(/**TrackerSearchM*/self => {
  return {
    get profile() {
      return getParent(self, 1);
    },
    get tracker() {
      return self.profile.tracker;
    },
    getResultsPage(index) {
      if (index >= self.pages.length) {
        return [];
      } else {
        return self.pages[index].results;
      }
    },
    wrapSearchPromise(type, promise) {
      const trackerId = self.tracker.id;
      self.setReadyState('loading');
      return promise.then(result => {
        if (isAlive(self)) {
          self.setReadyState('success');
          self.setResult(result);
        } else {
          debug('%s skip, dead', type, trackerId, result);
        }
      }, err => {
        if (isAlive(self)) {
          self.setReadyState('error');
        }
        debug('%s error', type, trackerId, err);
      });
    },
    search(query) {
      return self.wrapSearchPromise('search', self.tracker.worker.search(query));
    },
    searchNext() {
      return self.wrapSearchPromise('searchNext', self.tracker.worker.searchNext(self.nextQuery));
    },
    getResultCount() {
      return self.pages.reduce((sum, page) => {
        return sum + page.results.length;
      }, 0);
    },
  };
});

export default trackerSearchModel;