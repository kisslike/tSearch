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
 * @property {function(number, SortBy[]):TrackerSearchResult[]} getSearchResultsPage
 * @property {function:number} getSearchPageCount
 * @property {function} start
 * @property {function} stop
 */

/**
 * @typedef {{}} SortBy
 * @property {string} by
 * @property {number} direction
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
  const typeSortMap = {
    title: {
      reverse: true
    }
  };
  const sortResults = (results, sortByList) => {
    const sortFnList = sortByList.map(({by, direction}) => {
      const info = typeSortMap[by];
      return ({[by]: a}, {[by]: b}) => {
        if (info && info.reverse) {
          [a, b] = [b, a];
        }
        if (direction === 1) {
          [a, b] = [b, a];
        }
        return a === b ? 0 : a > b ? -1 : 1;
      };
    });
    results.sort((a, b) => {
      let result = 0;
      sortFnList.some(fn => {
        return (result = fn(a.result, b.result)) !== 0;
      });
      return result;
    });
    return results;
  };

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
    getSearchResultsPage(index, sortByList) {
      const results = [];
      self.profileTrackers.forEach(profileTracker => {
        results.push(...profileTracker.getSearchResultsPage(index));
      });
      return sortResults(results, sortByList);
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