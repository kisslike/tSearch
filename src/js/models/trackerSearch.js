import trackerModel from "./tracker";
import moment from "moment/moment";
import filesize from 'filesize';
const debug = require('debug')('trackerSearch');
const {types, isAlive} = require('mobx-state-tree');

moment.locale(chrome.i18n.getUILanguage());

/**
 * @typedef {{}} TrackerSearchM
 * Model:
 * @property {TrackerM} tracker
 * @property {string} readyState
 * @property {{url:string}} authRequired
 * @property {string} url
 * @property {Object} [nextQuery]
 * Actions:
 * @property {function(string)} setReadyState
 * @property {function(Object)} setAuthRequired
 * @property {function} clearNextQuery
 * Views:
 * @property {function(string, string, Promise):Promise} wrapSearchPromise
 * @property {function(string):Promise} search
 * @property {function:Promise} searchNext
 */

/**
 * @typedef {{}} TrackerResultM
 * Model:
 * @property {TrackerInfo} trackerInfo
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
  trackerInfo: types.frozen,
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
  nextQuery: types.frozen,
}).actions(/**TrackerSearchM*/self => {
  return {
    setReadyState(state) {
      self.readyState = state;
    },
    setAuthRequired(result) {
      self.authRequired = result;
    },
    setNextQuery(value) {
      self.nextQuery = value;
    }
  };
}).views(/**TrackerSearchM*/self => {
  return {
    wrapSearchPromise(trackerId, type, promise) {
      self.setReadyState('loading');
      self.setAuthRequired(null);
      return promise.then(result => {
        if (!isAlive(self)) {
          const err = new Error('SEARCH_IS_DEAD');
          err.code = 'SEARCH_IS_DEAD';
          throw err;
        }
        if (!result.success) {
          const err = new Error('AUTH');
          err.code = 'TRACKER_AUTH';
          err.url = result.url;
          throw err;
        } else {
          self.setReadyState('success');

          if (result.nextPageRequest) {
            self.setNextQuery(result.nextPageRequest);
          }

          result.results = result.results.filter(result => {
            if (!result.title || !result.url) {
              debug('[' + trackerId + ']', 'Skip torrent:', result);
              return false;
            } else {
              return true;
            }
          });

          return result;
        }
      }).catch(err => {
        if (err.code === 'SEARCH_IS_DEAD') {
          throw err;
        }

        if (err.code === 'TRACKER_AUTH') {
          self.setAuthRequired({
            url: err.url
          });
        } else {
          self.setReadyState('error');
        }
        throw err;
      });
    },
    search(query) {
      return self.wrapSearchPromise(self.tracker.id, 'search', self.tracker.worker.search(query));
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
export {trackerResultModel};