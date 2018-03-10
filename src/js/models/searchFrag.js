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
 * @property {function(ProfileTrackerM)} addProfileTracker
 * @property {function:ProfileTrackerM[]} getProfileTrackerList
 * @property {function(string):ProfileTrackerM} getProfileTrackerById
 * @property {function:ProfileTrackerM[]} getSelectedProfileTrackerList
 * @property {function} clearProfileTrackerList
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
      self.profile.getSearchTrackers().forEach(profileTracker => {
        self.addProfileTracker(profileTracker);
        profileTracker.createSearch(query);
      });
    },
    searchNext() {
      self.tables.push(searchFragTableModel.create({index: self.tables.length}));
      self.getProfileTrackerList().some(profileTracker => {
        if (isAlive(profileTracker)) {
          profileTracker.searchNext();
        }
      });
    },
    clearSearch() {
      self.clearProfileTrackerList();
      self.tables.forEach(table => {
        destroy(table);
      });
      self.profile.clearSearch();
    },
  };
}).views(/**SearchFragM*/self => {
  /**@type {Map.<string, ProfileTrackerM>}*/
  const profileTrackerList = new Map();
  return {
    get profile() {
      return getParent(self, 1).profile;
    },
    addProfileTracker(profileTracker) {
      profileTrackerList.set(profileTracker.id, profileTracker);
    },
    getProfileTrackerList() {
      return Array.from(profileTrackerList.values());
    },
    getSelectedProfileTrackerList() {
      let result = self.getProfileTrackerList().filter(a => a.selected);
      if (!result.length) {
        result = self.getProfileTrackerList();
      }
      return result;
    },
    clearProfileTrackerList() {
      profileTrackerList.clear();
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