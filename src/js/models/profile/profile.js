import profileTrackerModel from './profileTracker';
import {types} from "mobx-state-tree";

/**
 * @typedef {{}} ProfileM
 * Model:
 * @property {string} name
 * @property {ProfileTrackerM[]} trackers
 * Actions:
 * Views:
 * @property {string} state
 * @property {function:ProfileTrackerM[]} getSelectedProfileTrackers
 * @property {function:TrackerM[]} getTrackers
 * @property {function(string):ProfileTrackerM} getProfileTrackerById
 * @property {function} start
 * @property {function} stop
 */

const profileModel = types.model('profileModel', {
  name: types.identifier(types.string),
  trackers: types.optional(types.array(profileTrackerModel), []),
}).actions(/**ProfileM*/self => {
  return {

  };
}).views(/**ProfileM*/self => {
  return {
    getSelectedProfileTrackers() {
      let result = self.trackers.filter(a => a.selected);
      if (result.length === 0) {
        result = self.trackers;
      }
      return result;
    },
    getProfileTrackerById(id) {
      let result = null;
      self.trackers.some(tracker => {
        if (tracker.id === id) {
          result = tracker;
        }
      });
      return result;
    },
  };
});

export default profileModel;