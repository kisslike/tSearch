import trackerModel from "./tracker";
import moment from "moment/moment";
import filesize from 'filesize';
const debug = require('debug')('trackerSearch');
const {types, destroy, getParent, isAlive} = require('mobx-state-tree');

moment.locale(chrome.i18n.getUILanguage());

/**
 * @typedef {{}} TrackerSearchM
 * Model:
 * @property {TrackerM} tracker
 * @property {string} readyState
 * @property {{url:string}} authRequired
 * @property {string} url
 * @property {{results:TrackerSearchM}[]} pages
 * @property {Object} [nextQuery]
 * Actions:
 * @property {function(string)} setReadyState
 * @property {function(Object)} setResult
 * @property {function} clearNextQuery
 * Views:
 * @property {function(number):TrackerResultM[]} getResultsPage
 * @property {function(string, string, Promise):Promise} wrapSearchPromise
 * @property {function(string):Promise} search
 * @property {function:Promise} searchNext
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
 * @property {string} dateTitle
 * @property {string} dateText
 * @property {string} sizeText
 * Actions:
 * Views:
 */

const unixTimeToString = function (unixtime) {
  return unixtime <= 0 ? '∞' : moment(unixtime * 1000).format('lll');
};
const unixTimeToFromNow = function (unixtime) {
  return unixtime <= 0 ? '∞' : moment(unixtime * 1000).fromNow();
};

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
  dateTitle: types.string,
  dateText: types.string,
  sizeText: types.string,
}).preProcessSnapshot(snapshot => {
  ['size', 'seed', 'peer', 'date'].forEach(key => {
    let value = snapshot[key];
    if (typeof value !== 'number') {
      value = parseInt(value, 10);
      if (!isFinite(value)) {
        value = void 0;
      }
      snapshot[key] = value;
    }
  });
  snapshot.dateTitle = unixTimeToString(snapshot.date);
  snapshot.dateText = unixTimeToFromNow(snapshot.date);
  snapshot.sizeText = filesize(snapshot.size);
  return snapshot;
});

const trackerSearchModel = types.model('trackerSearchModel', {
  tracker: types.reference(trackerModel),
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
    },
    clearNextQuery() {
      self.nextQuery = null;
    }
  };
}).views(/**TrackerSearchM*/self => {
  return {
    getResultsPage(index) {
      if (index >= self.pages.length) {
        return [];
      } else {
        return self.pages[index].results;
      }
    },
    wrapSearchPromise(trackerId, type, promise) {
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
      return self.wrapSearchPromise(self.tracker.id, 'search', self.tracker.worker.search(query));
    },
    searchNext() {
      const nextQuery = self.nextQuery;
      self.clearNextQuery();
      if (nextQuery) {
        return self.wrapSearchPromise(self.tracker.id, 'searchNext', self.tracker.worker.searchNext(nextQuery));
      } else {
        return Promise.resolve();
      }
    },
    getResultCount() {
      return self.pages.reduce((sum, page) => {
        return sum + page.results.length;
      }, 0);
    },
  };
});

export default trackerSearchModel;