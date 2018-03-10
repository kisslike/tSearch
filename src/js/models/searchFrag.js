import searchFragTableModel from "./searchFragTable";
const debug = require('debug')('searchFrag');
const {types, getParent, isAlive, destroy} = require('mobx-state-tree');

/**
 * @typedef {{}} SearchFragM
 * Model:
 * @property {SearchFragTableM[]} tables
 * Actions:
 * @property {function(string)} search
 * @property {function} searchNext
 * @property {function} clearSearch
 * Views:
 * @property {ProfileM} profile
 * @property {function(ProfileTrackerM):number} getTrackerResultCount
 * @property {function(ProfileTrackerM):number} getTrackerVisibleResultCount
 */

const searchFragModel = types.model('searchFragModel', {
  tables: types.optional(types.array(searchFragTableModel), []),
}).actions(/**SearchFragM*/self => {
  return {
    search(query) {
      self.clearSearch();
      self.tables.push(searchFragTableModel.create({index: self.tables.length}));
      self.profile.getSelectedTrackers().forEach(profileTracker => {
        profileTracker.createSearch(query);
      });
    },
    searchNext() {
      self.tables.push(searchFragTableModel.create({index: self.tables.length}));
      self.profile.getSelectedTrackers().forEach(profileTracker => {
        profileTracker.searchNext();
      });
    },
    clearSearch() {
      self.tables.forEach(table => {
        destroy(table);
      });
      self.profile.profileTrackers.forEach(profileTracker => {
        profileTracker.clearSearch();
      });
    },
  };
}).views(/**SearchFragM*/self => {
  return {
    get profile() {
      return getParent(self, 1).profile;
    },
    getTrackerResultCount(profileTracker) {
      return self.tables.reduce((sum, table) => {
        return sum + table.getTrackerResultCount(profileTracker);
      }, 0);
    },
    getTrackerVisibleResultCount(profileTracker) {
      return self.tables.reduce((sum, table) => {
        return sum + table.getTrackerVisibleResultCount(profileTracker);
      }, 0);
    }
  };
});

export default searchFragModel;