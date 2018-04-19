import moment from "moment/moment";
import filesize from 'filesize';
import highlight from "../../tools/highlight";
import rate from "../../tools/rate";
import {types, isAlive} from "mobx-state-tree";
import profileTrackerModel from "../profile/profileTracker";

const debug = require('debug')('trackerSearch');

moment.locale(chrome.i18n.getUILanguage());

/**
 * @typedef {{}} TrackerSearchM
 * Model:
 * @property {string} id
 * @property {string} query
 * @property {ProfileTrackerM} profileTracker
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
 * @property {function:Object} getQueryHighlightMap
 * @property {function:Object} getQueryRateScheme
 * @property {function(number):TrackerResultM[]} getResultsPage
 * @property {function(string, string, function:Promise):Promise} wrapSearchPromise
 * @property {function:Promise} search
 * @property {function:Promise} searchNext
 */

/**
 * @typedef {{}} TrackerResultM
 * Model:
 * @property {string} id
 * @property {ProfileTrackerInfoM} trackerInfo
 * @property {string} title
 * @property {Object} titleHighlightMap
 * @property {string} url
 * @property {Object} rate
 * @property {number} quality
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
  id: types.identifier(types.string),
  trackerInfo: profileTrackerInfoModel,
  title: types.string,
  titleHighlightMap: types.frozen,
  url: types.string,
  rate: types.frozen,
  quality: types.number,
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
});

const trackerSearchModel = types.model('trackerSearchModel', {
  id: types.identifier(types.string),
  query: types.string,
  profileTracker: types.reference(profileTrackerModel),
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
      const queryHighlightMap = self.getQueryHighlightMap();
      const queryRateScheme = self.getQueryRateScheme();
      const pageIndex = self.pages.length;
      let index = 0;
      const results = result.results.filter(result => {
        if (!result.title || !result.url) {
          debug('[' + self.profileTracker.id + ']', 'Skip torrent:', result);
          return false;
        } else {
          ['size', 'seed', 'peer', 'date'].forEach(key => {
            let value = result[key];
            if (typeof value !== 'number') {
              value = parseInt(value, 10);
              if (!isFinite(value)) {
                value = void 0;
              }
              result[key] = value;
            }
          });
          result.id = self.id + '_' + pageIndex + '_' + index++;
          result.trackerInfo = self.profileTracker.getInfo();
          result.titleHighlightMap = highlight.getTextMap(result.title, queryHighlightMap);
          result.rate = rate.getRate(result, queryRateScheme);
          result.quality = result.rate.sum;
          result.dateTitle = unixTimeToString(result.date);
          result.dateText = unixTimeToFromNow(result.date);
          result.sizeText = filesize(result.size);
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
    getQueryHighlightMap() {
      return highlight.getMap(self.query);
    },
    getQueryRateScheme() {
      return rate.getScheme(self.query);
    },
    getResultsPage(index) {
      if (index >= self.pages.length) {
        return [];
      } else {
        return self.pages[index].results;
      }
    },
    wrapSearchPromise(trackerId, type, fn) {
      self.setReadyState('loading');
      return fn().then(result => {
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
              self.setReadyState('idle');
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
      return self.wrapSearchPromise(self.profileTracker.id, 'search', () => {
        return self.profileTracker.readyPromise.then(() => {
          if (isAlive(self.profileTracker)) {
            const trackerModule = self.profileTracker.trackerModule;
            if (!trackerModule) {
              const err = new Error('MODULE_NOT_FOUND');
              err.code = 'MODULE_NOT_FOUND';
              throw err;
            }
            return trackerModule.worker.search(self.query);
          } else {
            const err = new Error('PROFILE_IS_DEAD');
            err.code = 'PROFILE_IS_DEAD';
            throw err;
          }
        });
      });
    },
    searchNext() {
      const nextQuery = self.nextQuery;
      self.setNextQuery(null);
      if (nextQuery) {
        return self.wrapSearchPromise(self.profileTracker.id, 'searchNext', () => {
          return self.profileTracker.readyPromise.then(() => {
            if (isAlive(self.profileTracker)) {
              const trackerModule = self.profileTracker.trackerModule;
              if (!trackerModule) {
                const err = new Error('MODULE_NOT_FOUND');
                err.code = 'MODULE_NOT_FOUND';
                throw err;
              }
              return trackerModule.worker.searchNext(nextQuery);
            } else {
              const err = new Error('PROFILE_IS_DEAD');
              err.code = 'PROFILE_IS_DEAD';
              throw err;
            }
          });
        });
      } else {
        return Promise.resolve();
      }
    },
  };
});

export default trackerSearchModel;