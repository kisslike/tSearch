import trackerModel from "./tracker";
import moment from "moment/moment";
import filesize from 'filesize';
const debug = require('debug')('trackerSearch');
const {types, isAlive, clone} = require('mobx-state-tree');

moment.locale(chrome.i18n.getUILanguage());

/**
 * @typedef {{}} TrackerSearchM
 * Model:
 * @property {string} id
 * @property {TrackerM} tracker
 * @property {ProfileTrackerInfoM} trackerInfo
 * @property {string} readyState
 * @property {{url:string}} authRequired
 * @property {string} url
 * @property {{results:TrackerSearchM}[]} pages
 * @property {Object} [nextQuery]
 * Actions:
 * @property {function(string)} setReadyState
 * @property {function(Object)} setAuthRequired
 * @property {function(Object)} setNextQuery
 * @property {function(string, Object)} setResult
 * @property {function} clearNextQuery
 * Views:
 * @property {function(number):TrackerResultM[]} getResultsPage
 * @property {function(string, string, Promise):Promise} wrapSearchPromise
 * @property {function:Promise} search
 * @property {function:Promise} searchNext
 */

/**
 * @typedef {{}} TrackerResultM
 * Model:
 * @property {ProfileTrackerInfoM} trackerInfo
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

/**
 * @typedef {{}} ProfileTrackerInfoM
 * Model:
 * @property {string} id
 * @property {string} name
 * @property {string} iconClassName
 * Actions:
 * Views:
 */

const profileTrackerInfoModel = types.model('profileTrackerInfoModel', {
  id: types.string,
  name: types.string,
  iconClassName: types.string,
});

const trackerResultModel = types.model('trackerResultModel', {
  trackerInfo: profileTrackerInfoModel,
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
  id: types.identifier(types.string),
  query: types.string,
  tracker: types.reference(trackerModel),
  trackerInfo: profileTrackerInfoModel,
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
    setAuthRequired(value) {
      self.authRequired = value;
    },
    setNextQuery(value) {
      self.nextQuery = value;
    },
    setResult(trackerId, result) {
      const results = result.results.filter(result => {
        if (!result.title || !result.url) {
          debug('[' + self.tracker.id + ']', 'Skip torrent:', result);
          return false;
        } else {
          result.trackerInfo = clone(self.trackerInfo);
          return true;
        }
      });
      self.pages.push({
        results: results
      });

      if (result.nextPageRequest) {
        self.setNextQuery(result.nextPageRequest);
      }
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
        if (!result.success) {
          const err = new Error('Error');
          err.code = 'NOT_SUCCESS';
          err.result = result;
          throw err;
        }
        return result;
      }).then(result => {
        if (isAlive(self)) {
          self.setReadyState('success');
          self.setAuthRequired(null);
          self.setResult(trackerId, result);
        } else {
          debug('%s skip, dead', type, trackerId, result);
        }
      }, err => {
        if (isAlive(self)) {
          if (err.code === 'NOT_SUCCESS') {
            const result = err.result;
            if (result.error === 'AUTH') {
              self.setAuthRequired({
                url: result.url
              });
            } else {
              self.setReadyState('error');
            }
          } else {
            self.setReadyState('error');
          }
        }
        debug('%s error', type, trackerId, err);
      });
    },
    search() {
      return self.wrapSearchPromise(self.tracker.id, 'search', self.tracker.worker.search(self.query));
    },
    searchNext() {
      const nextQuery = self.nextQuery;
      self.setNextQuery(null);
      if (nextQuery) {
        return self.wrapSearchPromise(self.tracker.id, 'searchNext', self.tracker.worker.searchNext(nextQuery));
      } else {
        return Promise.resolve();
      }
    },
  };
});

export default trackerSearchModel;