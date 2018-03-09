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
 * @property {function} clearProfileTrackerList
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
  const profileTrackerList = [];
  return {
    get profile() {
      return getParent(self, 1).profile;
    },
    addProfileTracker(profileTracker) {
      profileTrackerList.push(profileTracker);
    },
    getProfileTrackerList() {
      return profileTrackerList;
    },
    clearProfileTrackerList() {
      profileTrackerList.splice(0);
    }
  };
});

export default searchFragModel;