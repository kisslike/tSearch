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
 * Views:
 * @property {function:TrackerM[]} getTrackers
 * @property {function} start
 * @property {function} stop
 */

const profileModel = types.model('profileModel', {
  name: types.identifier(types.string),
  profileTrackers: types.optional(types.array(profileTrackerModel), []),
}).actions(/**ProfileM*/self => {
  return {
    search(query) {
      self.profileTrackers.forEach(profileTracker => {
        profileTracker.createSearch(query);
      });
    },
  };
}).views(/**ProfileM*/self => {
  return {
    getTrackers() {
      return self.profileTrackers.map(profileTracker => profileTracker.tracker).filter(a => !!a);
    },
    start() {
      const trackers = self.getTrackers();
      trackers.forEach(tracker => {
        tracker.createWorker();
      });
    },
    stop() {
      self.profileTrackers.forEach(profileTracker => {
        profileTracker.clearSearch();
      });
      const trackers = self.getTrackers();
      trackers.forEach(tracker => {
        tracker.destroyWorker();
      });
    },
  };
});

export default profileModel;