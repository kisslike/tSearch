import sortResults from "../tools/sortResults";
const debug = require('debug')('searchFragTable');
const {types, getParent, isAlive, detach, unprotect} = require('mobx-state-tree');

/**
 * @typedef {{}} SearchFragTableM
 * Model:
 * @property {number} index
 * @property {SortBy[]} sortByList
 * Actions:
 * @property {function(string)} sortBy
 * @property {function(string)} subSortBy
 * Views:
 * @property {FilterM} filter
 * @property {SearchFragM} searchFrag
 * @property {function(ProfileTrackerM):TrackerResultM[]} getTrackerResults
 * @property {function(ProfileTrackerM):TrackerResultM[]} getFilteredTrackerResults
 * @property {function:TrackerResultM[]} getResults
 * @property {function:TrackerResultM[]} getFilteredResults
 * @property {function:TrackerResultM[]} getSortedFilteredResults
 * @property {function:boolean} hasMoreBtn
 * @property {function(string):SortBy} getSortBy
 * @property {function(Object)} handleMoreBtn
 * @property {function:boolean} isLastTable
 * @property {function(ProfileTrackerM):number} getTrackerResultCount
 * @property {function(ProfileTrackerM):number} getTrackerVisibleResultCount
 */

/**
 * @typedef {{}} SortBy
 * @property {string} by
 * @property {number} direction
 */

const searchFragTableModel = types.model('searchFragTableModel', {
  index: types.number,
  sortByList: types.optional(types.array(types.model('sortBy', {
    by: types.string,
    direction: types.optional(types.number, 0),
  })), [{by: 'title'}]),
}).actions(/**SearchFragTableM*/self => {
  return {
    sortBy(by) {
      let item = self.getSortBy(by);
      if (!item) {
        item = {by};
      } else {
        item.direction = item.direction === 0 ? 1 : 0;
      }
      self.sortByList = [item];
    },
    subSortBy(by) {
      let item = self.getSortBy(by);
      if (item) {
        detach(item);
        unprotect(item);
      }
      if (!item) {
        item = {by};
      } else {
        item.direction = item.direction === 0 ? 1 : 0;
      }
      self.sortByList.push(item);
    }
  };
}).views(/**SearchFragTableM*/self => {
  return {
    get searchFrag() {
      return getParent(self, 2);
    },
    get filter() {
      return getParent(self, 3).filter;
    },
    getTrackerResults(profileTracker) {
      return profileTracker.getSearchResultsPage(self.index);
    },
    getFilteredTrackerResults(profileTracker) {
      return self.filter.processResults(profileTracker.getSearchResultsPage(self.index));
    },
    getResults() {
      const results = [];
      self.searchFrag.getProfileTrackerList().forEach(profileTracker => {
        results.push(...self.getTrackerResults(profileTracker));
      });
      return results;
    },
    getFilteredResults() {
      const results = [];
      self.searchFrag.getSelectedProfileTrackerList().forEach(profileTracker => {
        results.push(...self.getFilteredTrackerResults(profileTracker));
      });
      return results;
    },
    getSortedFilteredResults() {
      return sortResults(self.getFilteredResults(), self.sortByList);
    },
    hasMoreBtn() {
      if (self.isLastTable()) {
        return self.searchFrag.getSelectedProfileTrackerList().some(profileTracker => {
          if (isAlive(profileTracker) && profileTracker.search) {
            return !!profileTracker.search.nextQuery;
          }
        });
      }
    },
    getSortBy(by) {
      let result = null;
      self.sortByList.some(sortBy => {
        if (sortBy.by === by) {
          result = sortBy;
          return true;
        }
      });
      return result;
    },
    handleMoreBtn(e) {
      e.preventDefault();
      self.searchFrag.searchNext();
    },
    isLastTable() {
      return self === self.searchFrag.tables.slice(-1)[0];
    },
    getTrackerResultCount(profileTracker) {
      return self.getTrackerResults(profileTracker).length;
    },
    getTrackerVisibleResultCount(profileTracker) {
      const selected = self.searchFrag.getSelectedProfileTrackerList();
      if (selected.indexOf(profileTracker) !== -1) {
        return self.getFilteredTrackerResults(profileTracker).length;
      } else {
        return 0;
      }
    },
  };
});

export default searchFragTableModel;