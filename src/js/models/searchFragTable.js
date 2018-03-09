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
 * @property {SearchFragM} searchFrag
 * @property {function:TrackerSearchResult[]} getResults
 * @property {function:TrackerSearchResult[]} getSortedResults
 * @property {function:boolean} hasMoreBtn
 * @property {function(string):SortBy} getSortBy
 * @property {function(Object)} handleMoreBtn
 * @property {function:boolean} isLastTable
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
    getResults() {
      const results = [];
      self.searchFrag.getProfileTrackerList().forEach(profileTracker => {
        results.push(...profileTracker.getSearchResultsPage(self.index));
      });
      return results;
    },
    getSortedResults() {
      return sortResults(self.getResults(), self.sortByList);
    },
    hasMoreBtn() {
      if (!self.isLastTable()) return false;
      return self.searchFrag.getProfileTrackerList().some(profileTracker => {
        if (isAlive(profileTracker) && profileTracker.search) {
          return !!profileTracker.search.nextQuery;
        }
      });
    },
    getSortBy(by) {
      let item = null;
      self.sortByList.some(sortBy => {
        if (sortBy.by === by) {
          item = sortBy;
          return true;
        }
      });
      return item;
    },
    handleMoreBtn(e) {
      e.preventDefault();
      self.searchFrag.searchNext();
    },
    isLastTable() {
      return self === self.searchFrag.tables.slice(-1)[0];
    }
  };
});

export default searchFragTableModel;