import profileModel from './profile';
import trackerModel from './tracker';
import searchFormModel from "./searchForm";
import searchFragModel from "./searchFrag";
import filterModel from "./filters";
const debug = require('debug')('indexModel');
const {types} = require('mobx-state-tree');

/**
 * @typedef {{}} IndexM
 * Model:
 * @property {ProfileM} profile
 * @property {ProfileM[]} profiles
 * @property {TrackerM[]} trackers
 * @property {SearchFormM} searchForm
 * @property {SearchFragM} searchFrag
 * Actions:
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
  searchFrag: types.optional(searchFragModel, {}),
  filter: types.optional(filterModel, {}),
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
    snapshot.profiles.push({
      name: 'Default 2',
      profileTrackers: [{
        id: 'nnmclub1',
        meta: {
          name: 'nnmclub1'
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