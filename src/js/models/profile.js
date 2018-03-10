import profileTrackerModel from './profileTracker';
const {types} = require('mobx-state-tree');

/**
 * @typedef {{}} ProfileM
 * Model:
 * @property {boolean} isEnabled
 * @property {string} name
 * @property {ProfileTrackerM[]} profileTrackers
 * Actions:
 * Views:
 * @property {function:ProfileTrackerM[]} getSelectedTrackers
 * @property {function:TrackerM[]} getTrackers
 * @property {function(string):ProfileTrackerM} getProfileTrackerById
 * @property {function} start
 * @property {function} stop
 */

const profileModel = types.model('profileModel', {
  name: types.identifier(types.string),
  profileTrackers: types.optional(types.array(profileTrackerModel), []),
}).actions(/**ProfileM*/self => {
  return {

  };
}).views(/**ProfileM*/self => {
  return {
    getSelectedTrackers() {
      let result = self.profileTrackers.filter(a => a.selected);
      if (result.length === 0) {
        result = self.profileTrackers;
      }
      return result;
    },
    getTrackers() {
      return self.profileTrackers.map(profileTracker => profileTracker.tracker).filter(a => !!a);
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
      const trackers = self.getTrackers();
      trackers.forEach(tracker => {
        tracker.destroyWorker();
      });
    },
  };
});

export default profileModel;