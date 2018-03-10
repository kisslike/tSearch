import profileTrackerModel from './profileTracker';
const {types} = require('mobx-state-tree');

/**
 * @typedef {{}} ProfileM
 * Model:
 * @property {boolean} isEnabled
 * @property {string} name
 * @property {ProfileTrackerM[]} profileTrackers
 * Actions:
 * @property {function(string)} search
 * @property {function} clearSearch
 * Views:
 * @property {function:ProfileTrackerM[]} getSearchTrackers
 * @property {function:ProfileTrackerM[]} getSelectedProfileTrackers
 * @property {function:TrackerM[]} getTrackers
 * @property {function:number} getSearchPageCount
 * @property {function(string):ProfileTrackerM} getProfileTrackerById
 * @property {function} start
 * @property {function} stop
 */

const profileModel = types.model('profileModel', {
  name: types.identifier(types.string),
  profileTrackers: types.optional(types.array(profileTrackerModel), []),
}).actions(/**ProfileM*/self => {
  return {
    search(query) {
      self.clearSearch();
      self.getSearchTrackers().forEach(profileTracker => {
        profileTracker.createSearch(query);
      });
    },
    clearSearch() {
      self.profileTrackers.forEach(profileTracker => {
        profileTracker.clearSearch();
      });
    }
  };
}).views(/**ProfileM*/self => {
  return {
    getSearchTrackers() {
      let profileTrackers = self.getSelectedProfileTrackers();
      if (profileTrackers.length === 0) {
        profileTrackers = self.profileTrackers;
      }
      return profileTrackers;
    },
    getSelectedProfileTrackers() {
      return self.profileTrackers.filter(a => a.selected);
    },
    getTrackers() {
      return self.profileTrackers.map(profileTracker => profileTracker.tracker).filter(a => !!a);
    },
    getSearchPageCount() {
      let result = 0;
      self.profileTrackers.forEach(profileTracker => {
        const count = profileTracker.getSearchPageCount();
        if (count > result) {
          result = count;
        }
      });
      return result;
    },
    getProfileTrackerById(id) {
      let result = null;
      self.profileTrackers.some(profileTracker => {
        if (profileTracker.id === id) {
          result = profileTracker;
        }
      });
      return result;
    },
    start() {
      const trackers = self.getTrackers();
      trackers.forEach(tracker => {
        tracker.createWorker();
      });
    },
    stop() {
      self.clearSearch();
      const trackers = self.getTrackers();
      trackers.forEach(tracker => {
        tracker.destroyWorker();
      });
    },
  };
});

export default profileModel;