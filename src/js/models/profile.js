import searchResultsModel from "./searchResults";
import profileTrackerModel from './profileTracker';
const {types} = require('mobx-state-tree');

/**
 * @typedef {{}} ProfileM
 * Model:
 * @property {boolean} isEnabled
 * @property {string} name
 * @property {ProfileTrackerM[]} profileTrackers
 * @property {SearchResultsM} searchResults
 * Actions:
 * @property {function(string)} search
 * Views:
 * @property {function:TrackerM[]} getTrackers
 * @property {function} init
 * @property {function} terminate
 */

const profileModel = types.model('profileModel', {
  name: types.identifier(types.string),
  profileTrackers: types.optional(types.array(profileTrackerModel), []),
  searchResults: types.maybe(searchResultsModel),
}).actions(/**ProfileM*/self => {
  return {
    search(query) {
      const searchResults = searchResultsModel.create({
        query: query
      });
      self.searchResults = searchResults;
      searchResults.search(self.getTrackers());
    },
  };
}).views(/**ProfileM*/self => {
  return {
    getTrackers() {
      return self.profileTrackers.map(profileTracker => profileTracker.tracker).filter(a => !!a);
    },
    init() {
      const trackers = self.getTrackers();
      trackers.forEach(tracker => {
        tracker.createWorker();
      });
    },
    terminate() {
      const trackers = self.getTrackers();
      trackers.forEach(tracker => {
        tracker.destroyWorker();
      });
    },
  };
});

export default profileModel;