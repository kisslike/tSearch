import searchFragTableModel from "./searchFragTable";
import trackerSearchModel from "./trackerSearch";
import {types, getParent, isAlive, destroy, resolveIdentifier} from "mobx-state-tree";

const debug = require('debug')('searchFrag');

/**
 * @typedef {{}} SearchFragM
 * Model:
 * @property {number} id
 * @property {string} query
 * @property {TrackerSearchM[]} trackerSearchList
 * @property {SearchFragTableM[]} tables
 * Actions:
 * @property {function} search
 * @property {function} searchNext
 * @property {function} clearSearch
 * Views:
 * @property {ProfileM} profile
 * @property {function:string} getTableId
 * @property {function:TrackerSearchM[]} getSelectedTrackerSearch
 * @property {function(TrackerSearchM):number} getTrackerResultCount
 * @property {function(TrackerSearchM):number} getTrackerVisibleResultCount
 * @property {function(TrackerM):number} getSearchTrackerByTracker
 */

const searchFragModel = types.model('searchFragModel', {
  id: types.identifier(types.number),
  query: types.string,
  trackerSearchList: types.optional(types.array(trackerSearchModel), []),
  tables: types.optional(types.array(searchFragTableModel), []),
}).actions(/**SearchFragM*/self => {
  return {
    search() {
      self.clearSearch();
      self.tables.push(searchFragTableModel.create({
        id: self.getTableId(),
        index: self.tables.length
      }));
      self.profile.getSelectedProfileTrackers().forEach(profileTracker => {
        const tracker = profileTracker.tracker;
        if (tracker) {
          const trackerSearch = trackerSearchModel.create({
            id: self.id + '_' + tracker.id,
            query: self.query,
            tracker: tracker,
            trackerInfo: profileTracker.getInfo()
          });
          self.trackerSearchList.push(trackerSearch);
          trackerSearch.search();
        }
      });
    },
    searchNext() {
      self.tables.push(searchFragTableModel.create({
        id: self.getTableId(),
        index: self.tables.length
      }));
      self.trackerSearchList.forEach(trackerSearch => {
        trackerSearch.searchNext();
      });
    },
    clearSearch() {
      self.tables.forEach(table => {
        destroy(table);
      });
      self.trackerSearchList.forEach(trackerSearch => {
        destroy(trackerSearch);
      });
    },
  };
}).views(/**SearchFragM*/self => {
  return {
    get profile() {
      return getParent(self, 1).profile;
    },
    getTableId() {
      return self.id + '_' + self.tables.length;
    },
    getSelectedTrackerSearch() {
      return self.profile.getSelectedProfileTrackers().map(profileTracker => {
        return self.getSearchTrackerByTracker(profileTracker.tracker);
      }).filter(a => !!a);
    },
    getTrackerResultCount(trackerSearch) {
      return self.tables.reduce((sum, table) => {
        return sum + table.getTrackerResultCount(trackerSearch);
      }, 0);
    },
    getTrackerVisibleResultCount(trackerSearch) {
      return self.tables.reduce((sum, table) => {
        return sum + table.getTrackerVisibleResultCount(trackerSearch);
      }, 0);
    },
    getSearchTrackerByTracker(tracker) {
      if (tracker) {
        return resolveIdentifier(trackerSearchModel, self, self.id + '_' + tracker.id);
      }
    },
  };
});

export default searchFragModel;