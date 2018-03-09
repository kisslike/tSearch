import sortResults from "../tools/sortResults";
const debug = require('debug')('SearchFrag');
const {types, getParent, isAlive, destroy, detach, unprotect} = require('mobx-state-tree');

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
      return self.index === self.searchFrag.tables.length - 1;
    }
  };
});

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