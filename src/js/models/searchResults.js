import trackerSearchModel from './trackerSearch';
const debug = require('debug')('searchResults');
const {types} = require('mobx-state-tree');

/**
 * @typedef {{}} SearchResultsM
 * Model:
 * @property {string} query
 * @property {TrackerSearchM[]} trackerResults
 * Actions:
 * @property {function(string, TrackerM[])} search
 * Views:
 * @property {function} searchNext
 * @property {function(string)} getTrackerSearchById
 * @property {string} readySate
 */

const searchResultsModel = types.model('searchResultsModel', {
  query: types.string,
  trackerResults: types.optional(types.array(trackerSearchModel), []),
}).actions(/**SearchResultsM*/self => {
  return {
    search(trackers) {
      trackers.forEach(tracker => {
        const trackerSearch = trackerSearchModel.create({
          trackerId: tracker.id
        });
        self.trackerResults.push(trackerSearch);
      });
      self.trackerResults.forEach(trackerSearch => {
        trackerSearch.search(self.query);
      });
    },
  };
}).views(/**SearchResultsM*/self => {
  return {
    searchNext() {
      self.trackerResults.forEach(/**TrackerSearchM*/trackerSearch => {
        trackerSearch.searchNext();
      });
    },
    getTrackerSearchById(id) {
      let trackerSearch = null;
      self.trackerResults.some(_trackerSearch => {
        if (_trackerSearch.trackerId === id) {
          return trackerSearch = _trackerSearch;
        }
      });
      return trackerSearch;
    },
    get readySate() {
      let state = 'loading';
      const isDone = self.trackers.every(trackerSearch => {
        return trackerSearch.readyState !== 'loading';
      });
      if (isDone) {
        state = 'complete';
      }
      return state;
    }
  };
});

export default searchResultsModel;