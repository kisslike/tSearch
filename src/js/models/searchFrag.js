import trackerSearchModel from "./trackerSearch";
import searchFragTableModel from "./searchFragTable";
const debug = require('debug')('SearchFrag');
const {types, getParent, isAlive} = require('mobx-state-tree');

/**
 * @typedef {{}} SearchFragM
 * Model:
 * @property {TrackerSearchM[]} trackerSearchList
 * @property {SearchFragTableM[]} tables
 * Actions:
 * @property {function(string)} search
 * @property {function} searchNext
 * @property {function} clearSearch
 * Views:
 * @property {ProfileM} profile
 * @property {function:TrackerSearchM} getTrackerSearch
 * @property {function(string):number} getTrackerResultCount
 * @property {function} beforeDestroy
 */

const searchFragModel = types.model('searchFragModel', {
  trackerSearchList: types.optional(types.array(trackerSearchModel), []),
  tables: types.optional(types.array(searchFragTableModel), []),
}).actions(/**SearchFragM*/self => {
  return {
    search(query) {
      self.clearSearch();
      const table = searchFragTableModel.create();
      self.tables.push(table);
      self.profile.getSearchTrackers().forEach(profileTracker => {
        const tracker = profileTracker.tracker;
        if (!tracker) return;

        const info = profileTracker.getInfo();
        const trackerSearch = trackerSearchModel.create({
          tracker: tracker.id
        });
        self.trackerSearchList.push(trackerSearch);
        trackerSearch.search(query).then(result => {
          result.results.forEach(result => {
            result.trackerInfo = info;
          });
          if (isAlive(table)) {
            table.addResults(result.results);
          }
        });
      });
    },
    searchNext() {
      const table = searchFragTableModel.create();
      self.tables.push(table);
      self.trackerSearchList.forEach(trackerSearch => {
        trackerSearch.searchNext().then(result => {
          result.results.forEach(result => {
            result.trackerInfo = info;
          });
          if (isAlive(table)) {
            table.addResults(result.results);
          }
        });
      });
    },
    clearSearch() {
      self.tables = [];
      self.trackerSearchList = [];
    },
  };
}).views(/**SearchFragM*/self => {
  return {
    get profile() {
      return getParent(self, 1).profile;
    },
    getTrackerSearch(trackerId) {
      let result = null;
      self.trackerSearchList.some(trackerSearch => {
        if (trackerSearch.tracker.id === trackerId) {
          return result = trackerSearch;
        }
      });
      return result;
    },
    getTrackerResultCount(trackerId) {
      return self.tables.reduce((sum, table) => {
        return sum + table.getTrackerResultCount(trackerId);
      }, 0);
    },
    beforeDestroy() {
      self.clearSearch();
    }
  };
});

export default searchFragModel;