import profileModel from './profile';
import trackerModel from './tracker';
import searchFormModel from "./searchForm";
import searchFragModel from "./searchFrag";
const debug = require('debug')('indexModel');
const {types, destroy} = require('mobx-state-tree');

/**
 * @typedef {{}} IndexM
 * Model:
 * @property {ProfileM} profile
 * @property {ProfileM[]} profiles
 * @property {TrackerM[]} trackers
 * @property {SearchFormM} searchForm
 * @property {SearchFragM} searchFrag
 * Actions:
 * @property {function(string)} createSearch
 * @property {function} clearSearch
 * @property {function(string)} setProfile
 * Views:
 * @property {function} onProfileChange
 * @property {function} afterCreate
 */

const indexModel = types.model('indexModel', {
  profile: types.reference(profileModel),
  profiles: types.array(profileModel),
  trackers: types.array(trackerModel),
  searchForm: types.optional(searchFormModel, {}),
  searchFrag: types.maybe(searchFragModel),
}).preProcessSnapshot(snapshot => {
  if (!snapshot.profiles.length) {
    snapshot.profiles.push({
      name: 'Default',
      profileTrackers: [{
        id: 'rutracker',
        meta: {
          name: 'rutracker'
        }
      }, {
        id: 'nnmclub',
        meta: {
          name: 'nnmclub'
        }
      }, {
        id: 'rutracker1',
        meta: {
          name: 'rutracker1'
        }
      }]
    });
  }
  const profileFound = snapshot.profiles.some(profile => {
    return snapshot.profile === profile.name;
  });
  if (!profileFound) {
    snapshot.profile = snapshot.profiles[0].name;
  }

  return snapshot;
}).actions(/**IndexM*/self => {
  return {
    createSearch(query) {
      self.searchFrag = searchFragModel.create({
        query
      });
      self.searchFrag.search(query);
    },
    clearSearch() {
      if (self.searchFrag) {
        destroy(self.searchFrag);
      }
    },
    setProfile(name) {
      self.profile = name;
      self.onProfileChange();
    },
  };
}).views(/**IndexM*/self => {
  return {
    onProfileChange() {
      self.profiles.forEach(profile => {
        if (self.profile !== profile) {
          profile.stop();
        }
      });
      self.profile.start();
    },
    afterCreate() {
      self.onProfileChange();
    }
  };
});

export default indexModel;