import sortResults from "../tools/sortResults";
import {trackerResultModel} from "./trackerSearch";
const debug = require('debug')('SearchFragTable');
const {types, getParent, isAlive, detach, unprotect} = require('mobx-state-tree');

/**
 * @typedef {{}} SearchFragTableM
 * Model:
 * @property {SortBy[]} sortByList
 * @property {TrackerResultM[]} results
 * Actions:
 * @property {function(string)} sortBy
 * @property {function(string)} subSortBy
 * @property {function(TrackerResultM[])} addResults
 * Views:
 * @property {SearchFragM} searchFrag
 * @property {function:TrackerSearchResult[]} getSortedResults
 * @property {function:boolean} hasMoreBtn
 * @property {function(string):SortBy} getSortBy
 * @property {function(Object)} handleMoreBtn
 * @property {function:boolean} isLastTable
 * @property {function(string):number} getTrackerResultCount
 */

/**
 * @typedef {{}} SortBy
 * @property {string} by
 * @property {number} direction
 */

const searchFragTableModel = types.model('searchFragTableModel', {
  sortByList: types.optional(types.array(types.model('sortBy', {
    by: types.string,
    direction: types.optional(types.number, 0),
  })), [{by: 'title'}]),
  results: types.optional(types.array(trackerResultModel), []),
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
    },
    addResults(results) {
      self.results.push(...results);
    }
  };
}).views(/**SearchFragTableM*/self => {
  return {
    get searchFrag() {
      return getParent(self, 2);
    },
    getSortedResults() {
      return sortResults(self.results, self.sortByList);
    },
    hasMoreBtn() {
      if (!self.isLastTable()) return false;
      return self.searchFrag.trackerSearchList.some(trackerSearch => {
        return !!trackerSearch.nextQuery;
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
      return self.searchFrag.tables.slice(-1)[0] === self;
    },
    getTrackerResultCount(trackerId) {
      return self.results.filter(r => r.trackerInfo.id === trackerId).length;
    }
  };
});

export default searchFragTableModel;