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
 * @property {function(ProfileM):number} getSearchTrackerByTracker
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
        const trackerSearch = trackerSearchModel.create({
          id: self.id + '_' + profileTracker.id,
          query: self.query,
          profileTracker: profileTracker
        });
        self.trackerSearchList.push(trackerSearch);
        trackerSearch.search();
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
        return self.getSearchTrackerByTracker(profileTracker);
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
    getSearchTrackerByTracker(profile) {
      return resolveIdentifier(trackerSearchModel, self, self.id + '_' + profile.id);
    },
  };
});

export default searchFragModel;