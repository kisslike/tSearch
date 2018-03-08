import trackerModel from "./tracker";
const debug = require('debug')('trackerSearch');
const {types, resolveIdentifier, destroy, getParent} = require('mobx-state-tree');

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
 * @property {TrackerM} tracker
 * @property {function(Promise):Promise} wrapSearchPromise
 * @property {function} searchNext
 * @property {function:number} getResultCount
 */

/**
 * @typedef {{}} trackerResultM
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
  categoryTitle: types.maybe(types.string),
  categoryUrl: types.maybe(types.string),
  size: types.maybe(types.number),
  downloadUrl: types.maybe(types.string),
  seed: types.maybe(types.number),
  peer: types.maybe(types.number),
  date: types.maybe(types.number),
});

const trackerSearchModel = types.model('trackerSearchModel', {
  readyState: types.optional(types.string, 'idle'), // idle, loading, success, error
  authRequired: types.maybe(types.model({
    url: types.string
  })),
  pages: types.optional(types.array(types.model({
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
}).views(/**TrackerSearchM*/self => {
  return {
    get tracker() {
      return getParent(self, 1).tracker;
    },
    wrapSearchPromise(promise) {
      self.setReadyState('loading');
      return promise.then(result => {
        debug('r', result);
        self.setResult(result);
        self.setReadyState('success');
      }, err => {
        debug('err', err);
        self.setReadyState('error');
      });
    },
    search(query) {
      return self.wrapSearchPromise(self.tracker.worker.search(query));
    },
    searchNext() {
      return self.wrapSearchPromise(self.tracker.worker.searchNext(self.nextQuery));
    },
    getResultCount() {
      return self.pages.reduce((sum, page) => {
        return sum + page.results.length;
      }, 0);
    },
  };
});

export default trackerSearchModel;