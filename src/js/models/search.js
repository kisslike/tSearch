const debug = require('debug')('search');
const {types, destroy} = require('mobx-state-tree');
import tracker from './tracker';


const trackerSearch = types.model({
  tracker: types.reference(tracker),
  readyState: types.optional(types.string, 'idle'), // idle, loading, success, error
  authRequired: types.maybe(types.model({
    url: types.string
  })),
  pages: types.optional(types.array(types.model({
    results: types.optional(types.array(types.frozen), []),
  })), []),
  nextQuery: types.frozen,
}).actions(self => {
  return {
    setReadyState(value) {
      self.readyState = value;
    },
    setResult(result) {
      if (result.success) {
        if (self.authRequired) {
          destroy(self.authRequired);
        }
        self.pages.push({
          results: result.results
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
}).views(self => {
  const wrapSearchPromise = promise => {
    self.setReadyState('loading');
    return promise.then(result => {
      debug('r', result);
      self.setResult(result);
      self.setReadyState('success');
    }, err => {
      debug('err', err);
      self.setReadyState('error');
    });
  };

  return {
    getResultCount() {
      return self.pages.reduce((sum, page) => {
        return sum + page.results.length;
      }, 0);
    },
    search(query) {
      wrapSearchPromise(self.tracker.worker.search(query));
    },
    searchNext() {
      wrapSearchPromise(self.tracker.worker.searchNext(self.nextQuery));
    }
  };
});

const search = types.model('search', {
  query: types.maybe(types.string),
  trackers: types.array(trackerSearch),
}).actions(self => {
  return {

  };
}).views(self => {
  return {
    search(query) {
      self.trackers.forEach(trackerSearch => {
        trackerSearch.search(query);
      });
    },
    searchNext() {
      self.trackers.forEach(trackerSearch => {
        trackerSearch.searchNext();
      });
    },
    getTrackerSearch(id) {
      let trackerSearch = null;
      self.trackers.some(_trackerSearch => {
        if (_trackerSearch.tracker.id === id) {
          return trackerSearch = _trackerSearch;
        }
      });
      return trackerSearch;
    },
    get readySate() {
      let state = 'loading';
      const isDone = self.trackers.every(trackerSearch => {
        return trackerSearch.readyState !== 'loading';
      });
      if (isDone) {
        state = 'complete';
      }
      return state;
    },
    getTrackerState(id) {
      let trackerSearch = null;
      self.trackers.some(_trackerSearch => {
        if (_trackerSearch.tracker.id === id) {
          trackerSearch = _trackerSearch;
        }
      });
      if (trackerSearch) {
        return trackerSearch.readyState;
      }
    },
  };
});

export default search;